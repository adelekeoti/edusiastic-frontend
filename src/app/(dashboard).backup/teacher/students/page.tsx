// src/app/(dashboard)/teacher/students/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Mail, 
  BookOpen, 
  Calendar,
  Loader2,
  UserCircle,
  Filter,
  Download
} from 'lucide-react';
import { getAllGroups, getGroupMembers } from '@/lib/api/groups';
import { LessonGroup, GroupMember, User } from '@/types';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface StudentWithGroups extends User {
  groups: string[]; // Group names
  groupIds: string[]; // Group IDs
  firstJoined: string;
  totalGroups: number;
}

export default function TeacherStudentsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentWithGroups[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentWithGroups[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [lessonGroups, setLessonGroups] = useState<LessonGroup[]>([]);

  // Redirect if not teacher
  useEffect(() => {
    if (user && user.role !== 'TEACHER') {
      toast.error('Access denied. Teachers only.');
      router.push('/dashboard');
    }
  }, [user, router]);

  // Fetch all students from lesson groups
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);

        // 1. Fetch all teacher's lesson groups
        const groupsResponse = await getAllGroups({ groupType: 'LESSON', limit: 100 });
        const groups = groupsResponse.data?.groups || [];
        setLessonGroups(groups);

        if (groups.length === 0) {
          setStudents([]);
          setFilteredStudents([]);
          setLoading(false);
          return;
        }

        // 2. Fetch members from each group
        const memberPromises = groups.map(group => 
          getGroupMembers(group.id).catch(err => {
            console.error(`Failed to fetch members for group ${group.id}:`, err);
            return { data: { members: [] } };
          })
        );

        const membersResponses = await Promise.all(memberPromises);

        // 3. Aggregate students from all groups
        const studentMap = new Map<string, StudentWithGroups>();

        groups.forEach((group, index) => {
          const members = membersResponses[index]?.data?.members || [];
          
          members.forEach((member: GroupMember) => {
            if (member.student) {
              const studentId = member.student.id;
              
              if (studentMap.has(studentId)) {
                const existing = studentMap.get(studentId)!;
                existing.groups.push(group.name);
                existing.groupIds.push(group.id);
                existing.totalGroups += 1;
                
                // Update first joined if this is earlier
                if (new Date(member.joinedAt) < new Date(existing.firstJoined)) {
                  existing.firstJoined = member.joinedAt;
                }
              } else {
                studentMap.set(studentId, {
                  ...member.student,
                  groups: [group.name],
                  groupIds: [group.id],
                  firstJoined: member.joinedAt,
                  totalGroups: 1
                });
              }
            }
          });
        });

        const studentsArray = Array.from(studentMap.values());
        setStudents(studentsArray);
        setFilteredStudents(studentsArray);
      } catch (error: any) {
        console.error('Failed to fetch students:', error);
        toast.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'TEACHER') {
      fetchStudents();
    }
  }, [user, router]);

  // Filter students based on search and group
  useEffect(() => {
    let filtered = students;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student => 
        student.firstName.toLowerCase().includes(query) ||
        student.lastName.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.school?.toLowerCase().includes(query)
      );
    }

    // Filter by group
    if (selectedGroup !== 'all') {
      filtered = filtered.filter(student => 
        student.groupIds.includes(selectedGroup)
      );
    }

    setFilteredStudents(filtered);
  }, [searchQuery, selectedGroup, students]);

  const stats = [
    {
      title: 'Total Students',
      value: students.length.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Groups',
      value: lessonGroups.filter(g => g.isActive).length.toString(),
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'This Month',
      value: students.filter(s => {
        const joinDate = new Date(s.firstJoined);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return joinDate >= monthAgo;
      }).length.toString(),
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
          <p className="text-gray-600 mt-2">
            Manage and communicate with your students
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search students by name, email, or school..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Group Filter */}
              <div className="w-full md:w-64">
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Groups</option>
                  {lessonGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Export Button */}
              <Button variant="outline" className="whitespace-nowrap">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        {filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {students.length === 0 ? 'No students yet' : 'No students found'}
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                {students.length === 0 
                  ? 'Students who join your lesson groups will appear here.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Students ({filteredStudents.length})</CardTitle>
              <CardDescription>
                {selectedGroup === 'all' 
                  ? 'All students across your groups' 
                  : `Students in ${lessonGroups.find(g => g.id === selectedGroup)?.name}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {student.profileImage ? (
                        <img
                          src={student.profileImage}
                          alt={`${student.firstName} ${student.lastName}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserCircle className="w-8 h-8 text-blue-600" />
                        </div>
                      )}
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {student.firstName} {student.lastName}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {student.email}
                          </p>
                          {student.school && (
                            <p className="text-sm text-gray-500 mt-1">
                              {student.school} {student.class && `• ${student.class}`}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Link href={`/messages?userId=${student.id}`}>
                            <Button size="sm" variant="outline">
                              <Mail className="w-4 h-4 mr-2" />
                              Message
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {/* Groups & Join Date */}
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{student.totalGroups} {student.totalGroups === 1 ? 'group' : 'groups'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {formatDistanceToNow(new Date(student.firstJoined), { addSuffix: true })}</span>
                        </div>
                      </div>

                      {/* Group Tags */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {student.groups.slice(0, 3).map((groupName, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {groupName}
                          </span>
                        ))}
                        {student.groups.length > 3 && (
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                            +{student.groups.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}