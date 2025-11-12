import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseServer'
import puppeteer from 'puppeteer'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { user_id, club_id, level_id } = await request.json()

    if (!user_id || !club_id || !level_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get user, club, and level data
    const { data: user } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', user_id)
      .single()

    const { data: club } = await supabase
      .from('clubs')
      .select('name, slug')
      .eq('id', club_id)
      .single()

    const { data: level } = await supabase
      .from('levels')
      .select('number, title, description')
      .eq('id', level_id)
      .single()

    if (!user || !club || !level) {
      return NextResponse.json({ error: 'Data not found' }, { status: 404 })
    }

    // Generate certificate HTML
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            width: 297mm;
            height: 210mm;
            font-family: 'Georgia', serif;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .certificate {
            width: 280mm;
            height: 190mm;
            background: white;
            padding: 40px;
            border: 20px solid #f0e68c;
            box-shadow: 0 0 40px rgba(0,0,0,0.2);
            position: relative;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .title {
            font-size: 48px;
            color: #2c3e50;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 4px;
          }
          .subtitle {
            font-size: 20px;
            color: #7f8c8d;
            margin-bottom: 40px;
          }
          .content {
            text-align: center;
            margin: 40px 0;
          }
          .recipient {
            font-size: 42px;
            color: #667eea;
            margin: 20px 0;
            font-weight: bold;
          }
          .description {
            font-size: 18px;
            color: #34495e;
            line-height: 1.6;
            max-width: 600px;
            margin: 20px auto;
          }
          .level {
            font-size: 32px;
            color: #e74c3c;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .signature {
            text-align: center;
          }
          .signature-line {
            width: 200px;
            border-top: 2px solid #2c3e50;
            margin-bottom: 10px;
          }
          .date {
            text-align: center;
            margin-top: 30px;
            font-size: 16px;
            color: #7f8c8d;
          }
          .club-name {
            font-size: 24px;
            color: #2c3e50;
            font-weight: bold;
          }
          .seal {
            position: absolute;
            bottom: 40px;
            right: 40px;
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: radial-gradient(circle, #f0e68c, #daa520);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
            color: #2c3e50;
            border: 3px solid #daa520;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">
            <div class="title">Certificate of Achievement</div>
            <div class="subtitle">This is to certify that</div>
          </div>
          
          <div class="content">
            <div class="recipient">${user.name}</div>
            <div class="description">
              has successfully completed
            </div>
            <div class="level">Level ${level.number}: ${level.title}</div>
            <div class="description">
              ${level.description}
            </div>
            <div class="club-name">${club.name}</div>
          </div>
          
          <div class="date">
            Issued on ${new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          
          <div class="footer">
            <div class="signature">
              <div class="signature-line"></div>
              <div>Club Admin</div>
            </div>
            <div class="signature">
              <div class="signature-line"></div>
              <div>Platform Director</div>
            </div>
          </div>
          
          <div class="seal">
            VERIFIED
          </div>
        </div>
      </body>
      </html>
    `

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()
    await page.setContent(certificateHTML, { waitUntil: 'networkidle0' })
    await page.setViewport({ width: 1122, height: 793 }) // A4 landscape

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
    })

    await browser.close()

    // Generate SHA-256 hash
    const hash = crypto.createHash('sha256').update(pdfBuffer).digest('hex')

    // Upload to Supabase Storage
    const fileName = `certificates/${club.slug}/${user_id}/level-${level.number}.pdf`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload certificate' },
        { status: 500 }
      )
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('certificates').getPublicUrl(fileName)

    // Get current user for issued_by
    const { data: authData } = await supabase.auth.getUser()

    // Save certificate record
    const { error: certError } = await supabase.from('certificates').insert({
      user_id,
      level_id,
      club_id,
      file_url: publicUrl,
      issued_by: authData?.user?.id || user_id,
      sha256_hash: hash,
    })

    if (certError) {
      console.error('Certificate record error:', certError)
      return NextResponse.json(
        { error: 'Failed to save certificate record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      hash,
    })
  } catch (error) {
    console.error('Certificate generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}