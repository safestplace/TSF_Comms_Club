import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseServer'
import crypto from 'crypto'
import PDFDocument from 'pdfkit'

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

    // Generate PDF using PDFKit
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
    })

    const buffers: Buffer[] = []
    doc.on('data', buffers.push.bind(buffers))
    doc.on('end', () => {})

    // Background gradient (simplified)
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#667eea')

    // Certificate border
    doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
       .fill('#ffffff')
       .stroke('#f0e68c')
       .lineWidth(10)

    // Title
    doc.fontSize(48)
       .fillColor('#2c3e50')
       .text('Certificate of Achievement', 0, 80, { align: 'center' })

    // Subtitle
    doc.fontSize(20)
       .fillColor('#7f8c8d')
       .text('This is to certify that', 0, 140, { align: 'center' })

    // Recipient name
    doc.fontSize(42)
       .fillColor('#667eea')
       .font('Helvetica-Bold')
       .text(user.name, 0, 180, { align: 'center' })

    // Description
    doc.fontSize(18)
       .fillColor('#34495e')
       .font('Helvetica')
       .text('has successfully completed', 0, 240, { align: 'center' })

    // Level
    doc.fontSize(32)
       .fillColor('#e74c3c')
       .font('Helvetica-Bold')
       .text(`Level ${level.number}: ${level.title}`, 0, 280, { align: 'center' })

    // Level description
    doc.fontSize(18)
       .fillColor('#34495e')
       .font('Helvetica')
       .text(level.description, 0, 330, { align: 'center', width: 400 })

    // Club name
    doc.fontSize(24)
       .fillColor('#2c3e50')
       .font('Helvetica-Bold')
       .text(club.name, 0, 380, { align: 'center' })

    // Date
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    doc.fontSize(16)
       .fillColor('#7f8c8d')
       .font('Helvetica')
       .text(`Issued on ${dateStr}`, 0, 450, { align: 'center' })

    // Signatures
    doc.fontSize(14)
       .fillColor('#2c3e50')
       .font('Helvetica')

    // Left signature
    doc.text('Club Admin', 100, 500, { align: 'center', width: 200 })
    doc.moveTo(50, 495).lineTo(250, 495).stroke()

    // Right signature
    doc.text('Platform Director', doc.page.width - 300, 500, { align: 'center', width: 200 })
    doc.moveTo(doc.page.width - 250, 495).lineTo(doc.page.width - 50, 495).stroke()

    // Seal
    doc.circle(doc.page.width - 120, doc.page.height - 120, 50)
       .fill('#f0e68c')
       .stroke('#daa520')
       .lineWidth(3)

    doc.fontSize(12)
       .fillColor('#2c3e50')
       .font('Helvetica-Bold')
       .text('VERIFIED', doc.page.width - 140, doc.page.height - 130, { align: 'center', width: 80 })

    doc.end()

    const pdfBuffer = Buffer.concat(buffers)

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
