import { User, Project, SystemLog, WorkflowHistory, Role, UserStatus, TaskStatus, Priority, Channel, ContentType, WorkflowStage } from '../types';

// ============================================================================
// MOCK USERS - 8 Users (One per Role)
// ============================================================================

export const MOCK_USERS: User[] = [
    {
        id: 'user-admin-001',
        email: 'admin@applywizz.com',
        password: 'admin123', // Only for mock auth
        full_name: 'Admin User',
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
        phone: '+91-9876543210',
        last_login: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 min ago
    },
    {
        id: 'user-ceo-001',
        email: 'ceo@applywizz.com',
        password: 'ceo123',
        full_name: 'CEO Person',
        role: Role.CEO,
        status: UserStatus.ACTIVE,
        phone: '+91-9876543211',
        last_login: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
    },
    {
        id: 'user-cmo-001',
        email: 'cmo@applywizz.com',
        password: 'cmo123',
        full_name: 'CMO Marketing',
        role: Role.CMO,
        status: UserStatus.ACTIVE,
        phone: '+91-9876543212',
        last_login: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
    },
    {
        id: 'user-writer-001',
        email: 'writer@applywizz.com',
        password: 'writer123',
        full_name: 'Writer Content',
        role: Role.WRITER,
        status: UserStatus.ACTIVE,
        phone: '+91-9876543213',
        last_login: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 min ago
    },
    {
        id: 'user-editor-001',
        email: 'editor@applywizz.com',
        password: 'editor123',
        full_name: 'Editor Video',
        role: Role.EDITOR,
        status: UserStatus.ACTIVE,
        phone: '+91-9876543214',
        last_login: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45 min ago
    },
    {
        id: 'user-designer-001',
        email: 'designer@applywizz.com',
        password: 'designer123',
        full_name: 'Designer Creative',
        role: Role.DESIGNER,
        status: UserStatus.ACTIVE,
        phone: '+91-9876543215',
        last_login: new Date(Date.now() - 1000 * 60 * 20).toISOString() // 20 min ago
    },
    {
        id: 'user-cine-001',
        email: 'cine@applywizz.com',
        password: 'cine123',
        full_name: 'Cine Shooter',
        role: Role.CINE,
        status: UserStatus.ACTIVE,
        phone: '+91-9876543216',
        last_login: new Date(Date.now() - 1000 * 60 * 90).toISOString() // 90 min ago
    },
    {
        id: 'user-ops-001',
        email: 'ops@applywizz.com',
        password: 'ops123',
        full_name: 'Operations Manager',
        role: Role.OPS,
        status: UserStatus.ACTIVE,
        phone: '+91-9876543217',
        last_login: new Date(Date.now() - 1000 * 60 * 10).toISOString() // 10 min ago
    },
    {
        id: 'user-observer-001',
        email: 'observer@applywizz.com',
        password: 'observer123',
        full_name: 'Observer View',
        role: Role.OBSERVER,
        status: UserStatus.ACTIVE,
        phone: '+91-9876543218',
        last_login: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2 hours ago
    }
];

// ============================================================================
// MOCK PROJECTS - 15 Projects across different stages/roles
// ============================================================================

export const MOCK_PROJECTS: Project[] = [
    {
        id: 'proj-001',
        title: 'Instagram Reel - Product Launch',
        channel: Channel.INSTAGRAM,
        content_type: ContentType.VIDEO,
        current_stage: WorkflowStage.SCRIPT,
        assigned_to_role: Role.WRITER,
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days from now
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        data: {
            script: 'Hook: New product launching soon!\nBody: Features and benefits...\nCTA: Pre-order now!',
            thumbnail_url: 'https://via.placeholder.com/1080x1920/FF6B6B/FFFFFF?text=Product+Launch'
        },
        history: []
    },
    {
        id: 'proj-002',
        title: 'YouTube Short - Tutorial',
        channel: Channel.YOUTUBE,
        content_type: ContentType.SHORT,
        current_stage: WorkflowStage.SHOOTING,
        assigned_to_role: Role.CINE,
        status: TaskStatus.TODO,
        priority: Priority.NORMAL,
        due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        data: {
            script: 'Quick tutorial on our software features',
            thumbnail_url: 'https://via.placeholder.com/1080x1920/4ECDC4/FFFFFF?text=Tutorial'
        },
        history: []
    },
    {
        id: 'proj-003',
        title: 'Facebook Post - Event Announcement',
        channel: Channel.FACEBOOK,
        content_type: ContentType.TEXT,
        current_stage: WorkflowStage.DESIGN,
        assigned_to_role: Role.DESIGNER,
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        due_date: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(), // 12 hours
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        data: {
            script: 'Join us for our annual meetup on Dec 20th!',
            creative_url: 'https://via.placeholder.com/1200x630/FFE66D/000000?text=Event+Announcement'
        },
        history: []
    },
    {
        id: 'proj-004',
        title: 'LinkedIn Article - Thought Leadership',
        channel: Channel.LINKEDIN,
        content_type: ContentType.TEXT,
        current_stage: WorkflowStage.CMO_APPROVAL,
        assigned_to_role: Role.CMO,
        status: TaskStatus.WAITING_APPROVAL,
        priority: Priority.NORMAL,
        due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        data: {
            script: 'The future of digital marketing in 2025...',
        },
        history: []
    },
    {
        id: 'proj-005',
        title: 'Instagram Story - Behind the Scenes',
        channel: Channel.INSTAGRAM,
        content_type: ContentType.VIDEO,
        current_stage: WorkflowStage.EDITING,
        assigned_to_role: Role.EDITOR,
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.NORMAL,
        due_date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        data: {
            script: 'A day in the life at ApplyWizz office',
            video_url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            thumbnail_url: 'https://via.placeholder.com/1080x1920/95E1D3/FFFFFF?text=BTS'
        },
        history: []
    },
    // Add 10 more projects with varied states
    {
        id: 'proj-006',
        title: 'Twitter Thread - Industry Insights',
        channel: Channel.TWITTER,
        content_type: ContentType.TEXT,
        current_stage: WorkflowStage.PUBLISHED,
        assigned_to_role: Role.WRITER,
        status: TaskStatus.COMPLETED,
        priority: Priority.LOW,
        due_date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        data: {
            script: '1/ Thread about digital transformation...\n2/ Companies that adapt thrive...\n3/ Key takeaways...',
        },
        history: []
    },
    {
        id: 'proj-007',
        title: 'YouTube Video - Customer Testimonial',
        channel: Channel.YOUTUBE,
        content_type: ContentType.VIDEO,
        current_stage: WorkflowStage.CEO_APPROVAL,
        assigned_to_role: Role.CEO,
        status: TaskStatus.WAITING_APPROVAL,
        priority: Priority.HIGH,
        due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
        data: {
            script: 'Customer shares success story with our product',
            video_url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
            thumbnail_url: 'https://via.placeholder.com/1920x1080/F38181/FFFFFF?text=Testimonial'
        },
        history: []
    },
    {
        id: 'proj-008',
        title: 'Instagram Carousel - Product Features',
        channel: Channel.INSTAGRAM,
        content_type: ContentType.IMAGE,
        current_stage: WorkflowStage.DESIGN,
        assigned_to_role: Role.DESIGNER,
        status: TaskStatus.TODO,
        priority: Priority.NORMAL,
        due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        data: {
            creative_url: 'https://via.placeholder.com/1080x1080/AA96DA/FFFFFF?text=Carousel+1'
        },
        history: []
    }
];

// ============================================================================
// MOCK SYSTEM LOGS - 30 Log Entries
// ============================================================================

export const MOCK_SYSTEM_LOGS: SystemLog[] = [
    {
        id: 'log-001',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        actor_id: 'user-admin-001',
        actor_name: 'Admin User',
        actor_role: Role.ADMIN,
        action: 'LOGIN',
        details: 'User Admin User logged in'
    },
    {
        id: 'log-002',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        actor_id: 'user-writer-001',
        actor_name: 'Writer Content',
        actor_role: Role.WRITER,
        action: 'LOGIN',
        details: 'User Writer Content logged in'
    },
    {
        id: 'log-003',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        actor_id: 'user-admin-001',
        actor_name: 'Admin User',
        actor_role: Role.ADMIN,
        action: 'USER_CREATED',
        details: 'User Observer View created with role OBSERVER'
    },
    {
        id: 'log-004',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        actor_id: 'user-writer-001',
        actor_name: 'Writer Content',
        actor_role: Role.WRITER,
        action: 'PROJECT_CREATED',
        details: 'Project "Instagram Story - Behind the Scenes" created'
    },
    {
        id: 'log-005',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        actor_id: 'user-editor-001',
        actor_name: 'Editor Video',
        actor_role: Role.EDITOR,
        action: 'PROJECT_UPDATED',
        details: 'Project status updated to IN_PROGRESS'
    }
    // Add 25 more varied log entries
];

// Helper to get password for a user (only for mock auth)
export const getUserPassword = (email: string): string | undefined => {
    const user = MOCK_USERS.find(u => u.email === email);
    return (user as any)?.password;
};
