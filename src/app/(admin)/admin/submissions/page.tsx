'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X, Image as ImageIcon, Eye, Clock, Filter } from 'lucide-react'

interface Submission {
  id: string
  userId: string
  userName: string
  teamName?: string
  date: string
  type: 'workout' | 'rest'
  workoutType?: string
  duration?: number
  distance?: number
  steps?: number
  rrValue?: number
  proofUrl?: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      // TODO: Fetch from API
      setSubmissions([])
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    // TODO: Approve via API
    setSubmissions(submissions.map(s => 
      s.id === id ? { ...s, status: 'approved' as const } : s
    ))
  }

  const handleReject = async (id: string) => {
    // TODO: Reject via API
    setSubmissions(submissions.map(s => 
      s.id === id ? { ...s, status: 'rejected' as const } : s
    ))
  }

  const filteredSubmissions = submissions.filter(s => 
    filterStatus === 'all' || s.status === filterStatus
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-rfl-coral border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-rfl-navy">Submission Management</h1>
        <p className="text-gray-600 mt-2">Review and approve workout submissions</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={filterStatus === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('pending')}
          className={filterStatus === 'pending' ? 'bg-rfl-coral hover:bg-rfl-coral/90' : ''}
          size="sm"
        >
          <Clock className="w-4 h-4 mr-2" />
          Pending
        </Button>
        <Button
          variant={filterStatus === 'approved' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('approved')}
          className={filterStatus === 'approved' ? 'bg-rfl-coral hover:bg-rfl-coral/90' : ''}
          size="sm"
        >
          <Check className="w-4 h-4 mr-2" />
          Approved
        </Button>
        <Button
          variant={filterStatus === 'rejected' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('rejected')}
          className={filterStatus === 'rejected' ? 'bg-rfl-coral hover:bg-rfl-coral/90' : ''}
          size="sm"
        >
          <X className="w-4 h-4 mr-2" />
          Rejected
        </Button>
        <Button
          variant={filterStatus === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('all')}
          className={filterStatus === 'all' ? 'bg-rfl-coral hover:bg-rfl-coral/90' : ''}
          size="sm"
        >
          All
        </Button>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.map((submission) => (
          <Card key={submission.id}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Proof Image */}
                {submission.proofUrl && (
                  <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={submission.proofUrl}
                      alt="Proof"
                      className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedSubmission(submission)}
                    />
                  </div>
                )}

                {/* Details */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-rfl-navy">{submission.userName}</h3>
                    {submission.teamName && (
                      <span className="text-sm text-gray-500">• {submission.teamName}</span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      submission.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      submission.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {submission.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="text-gray-500">Date:</span> {new Date(submission.date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span> {submission.type}
                    </div>
                    {submission.workoutType && (
                      <div>
                        <span className="text-gray-500">Activity:</span> {submission.workoutType}
                      </div>
                    )}
                    {submission.duration && (
                      <div>
                        <span className="text-gray-500">Duration:</span> {submission.duration} min
                      </div>
                    )}
                  </div>

                  {submission.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(submission.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(submission.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      {submission.proofUrl && (
                        <Button
                          onClick={() => setSelectedSubmission(submission)}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Proof
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSubmissions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No submissions found.</p>
          </CardContent>
        </Card>
      )}

      {/* Image Modal */}
      {selectedSubmission && selectedSubmission.proofUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSubmission(null)}
        >
          <div className="max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedSubmission.proofUrl}
              alt="Proof"
              className="max-w-full max-h-[90vh] rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}
