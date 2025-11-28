// src/components/groups/MembersManagement.tsx

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  UserMinus, 
  Search, 
  Mail, 
  School, 
  Calendar,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { getGroupMembers, addMemberToGroup, removeMemberFromGroup } from '@/lib/api/groups';
import { GroupMember, LessonGroup } from '@/types';
import { toast } from 'sonner';

interface MembersManagementProps {
  groupId: string;
  group: LessonGroup;
  onUpdate: () => void;
}

export default function MembersManagement({ groupId, group, onUpdate }: MembersManagementProps) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentIdToAdd, setStudentIdToAdd] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [groupId]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await getGroupMembers(groupId);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      setMembers(response.data.members);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!studentIdToAdd.trim()) {
      toast.error('Please enter a student ID');
      return;
    }

    // Check if group is full (for LESSON groups)
    if (group.groupType === 'LESSON' && members.length >= group.maxStudents) {
      toast.error(`Group is full. Maximum ${group.maxStudents} students allowed.`);
      return;
    }

    try {
      setAdding(true);
      await addMemberToGroup(groupId, studentIdToAdd.trim());
      toast.success('Student added successfully');
      setStudentIdToAdd('');
      loadMembers();
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add student');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to remove ${studentName} from this group?`)) {
      return;
    }

    try {
      await removeMemberFromGroup(groupId, studentId);
      toast.success('Student removed successfully');
      loadMembers();
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove student');
    }
  };

  const filteredMembers = members.filter(member => {
    const student = member.student;
    if (!student) return false;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      student.firstName.toLowerCase().includes(searchLower) ||
      student.lastName.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower) ||
      student.school?.toLowerCase().includes(searchLower)
    );
  });

  const isGroupFull = group.groupType === 'LESSON' && members.length >= group.maxStudents;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading members...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Member */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Student
          </CardTitle>
          <CardDescription>
            Add a student to this group by entering their student ID
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isGroupFull ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Group is Full</p>
                <p className="text-sm text-yellow-800">
                  This group has reached its maximum capacity of {group.maxStudents} students.
                  Remove a student or increase the group limit in settings to add more.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Input
                placeholder="Enter student ID..."
                value={studentIdToAdd}
                onChange={(e) => setStudentIdToAdd(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
                disabled={adding}
              />
              <Button onClick={handleAddMember} disabled={adding || !studentIdToAdd.trim()}>
                {adding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Group Members ({members.length})</CardTitle>
              {group.groupType === 'LESSON' && (
                <CardDescription>
                  {members.length} / {group.maxStudents} students enrolled
                </CardDescription>
              )}
            </div>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No members found' : 'No members yet'}
              </h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? 'Try a different search term' 
                  : 'Add students to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMembers.map((member) => {
                const student = member.student;
                if (!student) return null;

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={student.profileImage || '/default-avatar.png'}
                        alt={`${student.firstName} ${student.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {student.firstName} {student.lastName}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                          {student.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{student.email}</span>
                            </div>
                          )}
                          {student.school && (
                            <div className="flex items-center gap-1">
                              <School className="h-3 w-3" />
                              <span>{student.school}</span>
                            </div>
                          )}
                          {student.class && (
                            <Badge variant="outline" className="text-xs">
                              {student.class}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Joined {new Date(member.joinedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMember(student.id, `${student.firstName} ${student.lastName}`)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <UserMinus className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}