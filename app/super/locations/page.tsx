'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table'
import { Check, X, Plus } from 'lucide-react'

export default function LocationsPage() {
  const [states, setStates] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [pendingInstitutions, setPendingInstitutions] = useState<any[]>([])
  const [approvedInstitutions, setApprovedInstitutions] = useState<any[]>([])
  const [newStateName, setNewStateName] = useState('')
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null)
  const [newDistrictName, setNewDistrictName] = useState('')
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    // Get states
    const { data: statesData } = await supabase
      .from('states')
      .select('*')
      .order('name')
    setStates(statesData || [])

    // Get districts
    const { data: districtsData } = await supabase
      .from('districts')
      .select('*, states(name)')
      .order('name')
    setDistricts(districtsData || [])

    // Get pending institutions
    const { data: pendingInst } = await supabase
      .from('institutions')
      .select('*, districts(name, states(name))')
      .eq('status', 'pending')
      .order('name')
    setPendingInstitutions(pendingInst || [])

    // Get approved institutions
    const { data: approvedInst } = await supabase
      .from('institutions')
      .select('*, districts(name, states(name))')
      .eq('status', 'approved')
      .order('name')
    setApprovedInstitutions(approvedInst || [])

    setLoading(false)
  }

  const addState = async () => {
    if (!newStateName.trim()) return

    const { error } = await supabase
      .from('states')
      .insert({ name: newStateName.trim() })

    if (!error) {
      setNewStateName('')
      fetchData()
    }
  }

  const addDistrict = async () => {
    if (!newDistrictName.trim() || !selectedStateId) return

    const { error } = await supabase
      .from('districts')
      .insert({
        state_id: selectedStateId,
        name: newDistrictName.trim(),
      })

    if (!error) {
      setNewDistrictName('')
      fetchData()
    }
  }

  const approveInstitution = async (institutionId: number) => {
    const { error } = await supabase
      .from('institutions')
      .update({ status: 'approved' })
      .eq('id', institutionId)

    if (!error) fetchData()
  }

  const rejectInstitution = async (institutionId: number) => {
    const { error } = await supabase
      .from('institutions')
      .delete()
      .eq('id', institutionId)

    if (!error) fetchData()
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Location Management</h1>

      {/* Pending Institutions */}
      {pendingInstitutions.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pending Institutions ({pendingInstitutions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution Name</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInstitutions.map((institution) => (
                  <TableRow key={institution.id}>
                    <TableCell className="font-medium">{institution.name}</TableCell>
                    <TableCell>{institution.districts.name}</TableCell>
                    <TableCell>{institution.districts.states.name}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => approveInstitution(institution.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => rejectInstitution(institution.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Add State */}
        <Card>
          <CardHeader>
            <CardTitle>Add State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                value={newStateName}
                onChange={(e) => setNewStateName(e.target.value)}
                placeholder="State name"
              />
              <Button onClick={addState}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Existing States ({states.length})
              </p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {states.map((state) => (
                  <Badge key={state.id} variant="default">
                    {state.name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add District */}
        <Card>
          <CardHeader>
            <CardTitle>Add District</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <select
                value={selectedStateId || ''}
                onChange={(e) => setSelectedStateId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a state</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
              <div className="flex space-x-2">
                <Input
                  value={newDistrictName}
                  onChange={(e) => setNewDistrictName(e.target.value)}
                  placeholder="District name"
                />
                <Button onClick={addDistrict} disabled={!selectedStateId}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Districts Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>All Districts ({districts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>District Name</TableHead>
                <TableHead>State</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {districts.map((district) => (
                <TableRow key={district.id}>
                  <TableCell className="font-medium">{district.name}</TableCell>
                  <TableCell>{district.states.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approved Institutions */}
      <Card>
        <CardHeader>
          <CardTitle>Approved Institutions ({approvedInstitutions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institution Name</TableHead>
                <TableHead>District</TableHead>
                <TableHead>State</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvedInstitutions.map((institution) => (
                <TableRow key={institution.id}>
                  <TableCell className="font-medium">{institution.name}</TableCell>
                  <TableCell>{institution.districts.name}</TableCell>
                  <TableCell>{institution.districts.states.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}