"use client";

import React, { useState, useMemo } from "react";
import { Users, FileText, Bell, Clock, Trophy, Star, CheckCircle, UserPlus, Settings, BarChart3, MessageSquare, HelpCircle, ChevronUp, ChevronDown, Search, Filter, UserPlus as UserPlusIcon, CheckCircle as CheckIcon, Link, X, Calendar, Target, Code, Presentation } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/components/auth/AuthProvider";

// Data Table Component
export type DataTableColumn<T> = {
  key: keyof T;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
};

export type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  className?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  itemsPerPage?: number;
  showPagination?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  compact?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T, index: number) => void;
};

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  className,
  searchable = true,
  searchPlaceholder = "Search...",
  itemsPerPage = 10,
  showPagination = true,
  striped = false,
  hoverable = true,
  bordered = true,
  compact = false,
  loading = false,
  emptyMessage = "No data available",
  onRowClick,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (search) {
      filtered = filtered.filter((row) =>
        columns.some((column) => {
          const value = row[column.key];
          return value?.toString().toLowerCase().includes(search.toLowerCase());
        }),
      );
    }

    Object.entries(columnFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((row) => {
          const rowValue = row[key as keyof T];
          return rowValue
            ?.toString()
            .toLowerCase()
            .includes(value.toLowerCase());
        });
      }
    });

    return filtered;
  }, [data, search, columnFilters, columns]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    if (!showPagination) return sortedData;

    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage, showPagination]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (key: keyof T) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleColumnFilter = (key: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const clearColumnFilter = (key: string) => {
    setColumnFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  if (loading) {
    return (
      <div className={cn("w-full bg-card rounded-2xl ", className)}>
        <div className="animate-pulse p-6">
          {searchable && <div className="mb-6 h-11 bg-muted rounded-2xl"></div>}
          <div className="border border-border overflow-hidden">
            <div className="bg-muted/30 h-14"></div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-14 border-t border-border bg-card"
              ></div>
            ))}
          </div>
          <div className="mt-6 flex justify-between items-center">
            <div className="h-4 bg-muted rounded w-48"></div>
            <div className="flex gap-2">
              <div className="h-9 w-20 bg-muted rounded-2xl"></div>
              <div className="h-9 w-9 bg-muted rounded-2xl"></div>
              <div className="h-9 w-9 bg-muted rounded-2xl"></div>
              <div className="h-9 w-16 bg-muted rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full bg-card rounded-2xl",
        bordered && "border border-border",
        className,
      )}
    >
      {searchable && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border-b border-border">
          <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-input rounded-2xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
          </div>
        </div>
      )}
      <div
        className={cn(
          "overflow-hidden bg-muted/30",
          searchable ? "rounded-b-2xl" : "rounded-2xl",
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-muted/30">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      "text-left font-medium text-muted-foreground bg-muted/30",
                      compact ? "px-4 py-3" : "px-6 py-4",
                      column.sortable &&
                        "cursor-pointer hover:bg-muted/50 transition-colors",
                      column.width && `w-[${column.width}]`,
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {column.header}
                        </span>
                        {column.sortable && (
                          <div className="flex flex-col">
                            <ChevronUp
                              className={cn(
                                "h-3 w-3",
                                sortConfig.key === column.key &&
                                  sortConfig.direction === "asc"
                                  ? "text-primary"
                                  : "text-muted-foreground/40",
                              )}
                            />
                            <ChevronDown
                              className={cn(
                                "h-3 w-3 -mt-1",
                                sortConfig.key === column.key &&
                                  sortConfig.direction === "desc"
                                  ? "text-primary"
                                  : "text-muted-foreground/40",
                              )}
                            />
                          </div>
                        )}
                      </div>
                      {column.filterable && (
                        <div className="relative">
                          <Filter className="h-3 w-3 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    {column.filterable && (
                      <div className="mt-3">
                        <Input
                          type="text"
                          placeholder="Filter..."
                          value={columnFilters[String(column.key)] || ""}
                          onChange={(e) =>
                            handleColumnFilter(
                              String(column.key),
                              e.target.value,
                            )
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-3 py-1.5 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                        />
                        {columnFilters[String(column.key)] && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearColumnFilter(String(column.key));
                            }}
                            className="absolute right-2 top-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-card">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className={cn(
                      "text-center text-muted-foreground bg-card",
                      compact ? "px-4 py-12" : "px-6 py-16",
                    )}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="text-4xl">📊</div>
                      <div className="font-medium">{emptyMessage}</div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr
                    key={index}
                    className={cn(
                      "border-t border-border bg-card transition-colors",
                      striped && index % 2 === 0 && "bg-muted/20",
                      hoverable && "hover:bg-muted/30",
                      onRowClick && "cursor-pointer",
                    )}
                    onClick={() => onRowClick?.(row, index)}
                  >
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={cn(
                          "text-sm text-foreground",
                          compact ? "px-4 py-3" : "px-6 py-4",
                        )}
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : String(row[column.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showPagination && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-card border-t border-border">
          <div className="text-sm text-muted-foreground order-2 sm:order-1">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, sortedData.length)} of{" "}
            {sortedData.length} results
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pageNumber =
                  currentPage <= 3
                    ? i + 1
                    : currentPage >= totalPages - 2
                      ? totalPages - 4 + i
                      : currentPage - 2 + i;

                if (pageNumber < 1 || pageNumber > totalPages) return null;

                return (
                  <Button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    className="w-9 h-9 p-0"
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Dashboard Component
interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: "high" | "medium" | "low";
  timestamp: string;
}

interface Project {
  id: number;
  name: string;
  team: string;
  category: string;
  status: "submitted" | "in-review" | "scored";
  score?: number;
}

interface TeamInvitation {
  id: number;
  teamName: string;
  invitedBy: string;
  timestamp: string;
}

function HackathonDashboard() {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access the hackathon dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/auth'}>
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const announcements: Announcement[] = [
    {
      id: 1,
      title: "Submission Deadline Extended",
      content: "The project submission deadline has been extended to 11:59 PM tomorrow.",
      priority: "high",
      timestamp: "2 hours ago"
    },
    {
      id: 2,
      title: "Lunch Break",
      content: "Lunch will be served in the main hall from 12:00 PM to 1:00 PM.",
      priority: "medium",
      timestamp: "4 hours ago"
    },
    {
      id: 3,
      title: "WiFi Information",
      content: "WiFi Network: HackathonGuest, Password: hack2024",
      priority: "low",
      timestamp: "6 hours ago"
    }
  ];

  const projects: Project[] = [
    {
      id: 1,
      name: "EcoTracker",
      team: "Green Coders",
      category: "Sustainability",
      status: "submitted"
    },
    {
      id: 2,
      name: "HealthBot AI",
      team: "MedTech Innovators",
      category: "Healthcare",
      status: "in-review"
    },
    {
      id: 3,
      name: "FinanceFlow",
      team: "Money Masters",
      category: "Fintech",
      status: "scored",
      score: 85
    }
  ];

  const teamInvitations: TeamInvitation[] = [
    {
      id: 1,
      teamName: "Code Warriors",
      invitedBy: "John Doe",
      timestamp: "1 hour ago"
    },
    {
      id: 2,
      teamName: "Tech Titans",
      invitedBy: "Jane Smith",
      timestamp: "3 hours ago"
    }
  ];

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "secondary";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "submitted": return "secondary";
      case "in-review": return "outline";  
      case "scored": return "default";
      default: return "secondary";
    }
  };

  const projectColumns: DataTableColumn<Project>[] = [
    { key: "name", header: "Project Name", sortable: true, filterable: true },
    { key: "team", header: "Team", sortable: true, filterable: true },
    { key: "category", header: "Category", sortable: true, filterable: true },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (value) => (
        <Badge variant={getStatusVariant(value)}>
          {value.replace("-", " ")}
        </Badge>
      )
    },
    {
      key: "score",
      header: "Score",
      sortable: true,
      render: (value) => value ? `${value}/100` : "-"
    }
  ];

  const renderParticipantView = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Teams</p>
              <p className="text-xl font-semibold">156</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Submissions</p>
              <p className="text-xl font-semibold">89</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Updates</p>
              <p className="text-xl font-semibold">12</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Time Left</p>
              <p className="text-xl font-semibold">18h 42m</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Updates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="border-l-2 border-primary/30 pl-4 py-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-sm">{announcement.title}</h4>
                  <Badge variant={getPriorityVariant(announcement.priority)} className="text-xs">
                    {announcement.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{announcement.content}</p>
                <p className="text-xs text-muted-foreground/70 mt-2">{announcement.timestamp}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Team Invitations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamInvitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                <div>
                  <h4 className="font-medium text-sm">{invitation.teamName}</h4>
                  <p className="text-sm text-muted-foreground">Invited by {invitation.invitedBy}</p>
                  <p className="text-xs text-muted-foreground/70">{invitation.timestamp}</p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Accept
                  </Button>
                  <Button size="sm" variant="ghost">
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderJudgeView = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">To Review</p>
              <p className="text-xl font-semibold">23</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-xl font-semibold">15</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Avg. Time</p>
              <p className="text-xl font-semibold">12m</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects to Evaluate</CardTitle>
          <CardDescription>Review and score submitted projects</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={projects}
            columns={projectColumns}
            searchPlaceholder="Search projects..."
            itemsPerPage={5}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Judging Criteria</CardTitle>
          <CardDescription>Each project is evaluated on these four dimensions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Innovation (25%)</h4>
              </div>
              <p className="text-sm text-muted-foreground">Originality and creativity</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Technical (25%)</h4>
              </div>
              <p className="text-sm text-muted-foreground">Quality and execution</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Impact (25%)</h4>
              </div>
              <p className="text-sm text-muted-foreground">Real-world value</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Presentation className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Presentation (25%)</h4>
              </div>
              <p className="text-sm text-muted-foreground">Demo and communication</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderOrganizerView = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Participants</p>
              <p className="text-xl font-semibold">342</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Submissions</p>
              <p className="text-xl font-semibold">89</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Judges</p>
              <p className="text-xl font-semibold">12</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Completion</p>
              <p className="text-xl font-semibold">73%</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Event Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Bell className="h-4 w-4 mr-3" />
              Send Announcement
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-3" />
              Manage Teams
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Trophy className="h-4 w-4 mr-3" />
              View Submissions
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="h-4 w-4 mr-3" />
              Export Results
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm">New team "AI Innovators" registered</p>
              <span className="text-xs text-muted-foreground ml-auto">5m ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm">Project "EcoTracker" submitted</p>
              <span className="text-xs text-muted-foreground ml-auto">12m ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-sm">Judge completed review for "HealthBot AI"</p>
              <span className="text-xs text-muted-foreground ml-auto">25m ago</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>Manage all event submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={projects}
            columns={projectColumns}
            searchPlaceholder="Search all projects..."
            itemsPerPage={10}
          />
        </CardContent>
      </Card>
    </div>
  );

  const renderFAQ = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Frequently Asked Questions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-b pb-4">
          <h4 className="font-medium mb-2">How do I submit my project?</h4>
          <p className="text-sm text-muted-foreground">
            You can submit your project through the submission portal. Make sure to include all required files and documentation.
          </p>
        </div>
        <div className="border-b pb-4">
          <h4 className="font-medium mb-2">What are the judging criteria?</h4>
          <p className="text-sm text-muted-foreground">
            Projects are evaluated based on innovation, technical implementation, impact, and presentation quality.
          </p>
        </div>
        <div className="border-b pb-4">
          <h4 className="font-medium mb-2">Can I change my team after registration?</h4>
          <p className="text-sm text-muted-foreground">
            Team changes are allowed until 24 hours before the submission deadline. Contact organizers for assistance.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const currentView = user.role;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.displayName}
          </p>
          <Badge variant="outline" className="mt-2">
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Badge>
        </div>

        {currentView === "participant" && renderParticipantView()}
        {currentView === "judge" && renderJudgeView()}
        {currentView === "organizer" && renderOrganizerView()}

        {renderFAQ()}
      </div>
    </div>
  );
}

export const HackathonPlatform: React.FC = () => {
  return <HackathonDashboard />;
};
