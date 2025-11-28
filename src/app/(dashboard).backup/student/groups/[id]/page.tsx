// src/app/(dashboard)/student/groups/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Users, 
  BookOpen, 
  MessageSquare, 
  Loader2,
  AlertCircle,
  Calendar,
  Mail,
  School,
  LogOut,
  ExternalLink,
  Clock,
  CheckCircle,
  Eye,
  Heart
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { getGroupById, leaveGroup, getGroupMembers } from '@/lib/api/groups';
import { getAllAssignments } from '@/lib/api/assignments';
import { getGroupPosts } from '@/lib/api/posts';
import { LessonGroup, GroupMember, Assignment, Post } from '@/types';
import { toast } from 'sonner';

export default function StudentGroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const groupId = params.id as string;

  const [group, setGroup] = useState<LessonGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Email verification check
  useEffect(() => {
    if (user && !user.isVerified) {
      router.push('/verify-email-prompt');
    }
  }, [user, router]);

  useEffect(() => {
    if (groupId) {
      loadGroupData();
    }
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      
      // Load group details
      const groupResponse = await getGroupById(groupId);
      if (!groupResponse.data) {
        throw new Error('Group not found');
      }
      setGroup(groupResponse.data.group);

      // Load members
      const membersResponse = await getGroupMembers(groupId);
      if (membersResponse.data) {
        setMembers(membersResponse.data.members);
      }

      // Load assignments
      const assignmentsResponse = await getAllAssignments(groupId);
      if (assignmentsResponse.data) {
        setAssignments(assignmentsResponse.data.assignments);
      }

      // Load posts
      const postsResponse = await getGroupPosts(groupId);
      if (postsResponse.data) {
        setPosts(postsResponse.data.posts);
       }

    } catch (error: any) {
      console.error('Error loading group data:', error);
      toast.error(error.message || 'Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!group) return;
    
    if (!confirm(`Are you sure you want to leave "${group.name}"? You may need to be re-added by the teacher.`)) {
      return;
    }

    try {
      await leaveGroup(groupId);
      toast.success('Successfully left the group');
      router.push('/student/groups');
    } catch (error: any) {
      toast.error(error.message || 'Failed to leave group');
    }
  };

  const getAssignmentStatusBadge = (assignment: Assignment) => {
    if (!assignment.dueDate) {
      return <Badge variant="secondary">No Due Date</Badge>;
    }

    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isOverdue = dueDate < now;

    if (isOverdue) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Overdue
        </Badge>
      );
    }

    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 3) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        Due in {daysUntilDue} days
      </Badge>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading group details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!group) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Group Not Found</h2>
            <p className="text-gray-600 mb-6">
              The group you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => router.push('/student/groups')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Groups
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/student/groups')}
          className="pl-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Groups
        </Button>

        {/* Group Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={group.groupType === 'LESSON' ? 'default' : 'secondary'}>
                    {group.groupType}
                  </Badge>
                  {!group.isActive && (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </div>
                <CardTitle className="text-2xl">{group.name}</CardTitle>
                {group.description && (
                  <CardDescription className="mt-2 text-base">
                    {group.description}
                  </CardDescription>
                )}
              </div>
              <Button
                variant="outline"
                onClick={handleLeaveGroup}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Leave Group
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Teacher Info */}
              {group.teacher && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={group.teacher.profileImage || '/default-avatar.png'}
                    alt={`${group.teacher.firstName} ${group.teacher.lastName}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {group.teacher.title} {group.teacher.firstName} {group.teacher.lastName}
                    </p>
                    <p className="text-sm text-gray-600">Group Teacher</p>
                    <Button
                      variant="link"
                      size="sm"
                      className="pl-0 h-auto"
                      onClick={() => router.push(`/teacher/${group.teacher?.id}`)}
                    >
                      View Profile
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Group Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Users className="h-6 w-6 mx-auto text-gray-600 mb-2" />
                  <p className="text-2xl font-bold">{members.length}</p>
                  <p className="text-xs text-gray-600">Members</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <BookOpen className="h-6 w-6 mx-auto text-gray-600 mb-2" />
                  <p className="text-2xl font-bold">{assignments.length}</p>
                  <p className="text-xs text-gray-600">Assignments</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <MessageSquare className="h-6 w-6 mx-auto text-gray-600 mb-2" />
                  <p className="text-2xl font-bold">{posts.length}</p>
                  <p className="text-xs text-gray-600">Posts</p>
                </div>
              </div>
            </div>

            {/* Linked Product */}
            {group.product && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Linked Course:</p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-blue-900">{group.product.title}</p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => router.push(`/products/${group.product?.id}`)}
                  >
                    View Course
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assignments">
              Assignments ({assignments.length})
            </TabsTrigger>
            <TabsTrigger value="posts">
              Posts ({posts.length})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Group Members ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {members.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No members yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members.map((member) => {
                      const student = member.student;
                      if (!student) return null;

                      return (
                        <div
                          key={member.id}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                        >
                          <img
                            src={student.profileImage || '/default-avatar.png'}
                            alt={`${student.firstName} ${student.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {student.firstName} {student.lastName}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-4">
            {assignments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No assignments yet</h3>
                  <p className="text-gray-600">
                    Your teacher hasn't posted any assignments for this group yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              assignments.map((assignment) => (
                <Card
                  key={assignment.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/student/assignments/${assignment.id}`)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {assignment.title}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {assignment.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            {getAssignmentStatusBadge(assignment)}
                            
                            <div className="flex items-center gap-1 text-gray-600">
                              <CheckCircle className="h-4 w-4" />
                              <span>{assignment.totalPoints} points</span>
                            </div>

                            <div className="flex items-center gap-1 text-gray-500 text-xs">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Posted {new Date(assignment.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-4">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600">
                    No announcements or updates have been posted to this group yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="pt-6">
                    {/* Post Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={post.teacher?.profileImage || '/default-avatar.png'}
                        alt={`${post.teacher?.firstName} ${post.teacher?.lastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {post.teacher?.title} {post.teacher?.firstName} {post.teacher?.lastName}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-700 whitespace-pre-wrap mb-3">{post.content}</p>

                    {/* Post Image */}
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-64 object-cover rounded-lg mb-3"
                      />
                    )}

                    {/* Post Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{post.likesCount || 0} likes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.viewsCount || 0} views</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}