import { MOCK_USERS, MOCK_PROJECTS, MOCK_SYSTEM_LOGS, getUserPassword } from './mockData';
import { User, Project, SystemLog, Role, UserStatus, TaskStatus, Channel, WorkflowStage } from '../types';

// ============================================================================
// IN-MEMORY DATABASE STATE
// ============================================================================

let users: User[] = [...MOCK_USERS];
let projects: Project[] = [...MOCK_PROJECTS];
let systemLogs: SystemLog[] = [...MOCK_SYSTEM_LOGS];
let currentUser: User | null = null;

// ID generators
let userIdCounter = users.length + 1;
let projectIdCounter = projects.length + 1;
let logIdCounter = systemLogs.length + 1;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const delay = (ms: number = 200) => new Promise(resolve => setTimeout(resolve, ms));

const saveToLocalStorage = () => {
  try {
    localStorage.setItem('mock_users', JSON.stringify(users));
    localStorage.setItem('mock_projects', JSON.stringify(projects));
    localStorage.setItem('mock_logs', JSON.stringify(systemLogs));
  } catch (error) {
    console.warn('Failed to persist to localStorage:', error);
  }
};

const loadFromLocalStorage = () => {
  try {
    const savedUsers = localStorage.getItem('mock_users');
    const savedProjects = localStorage.getItem('mock_projects');
    const savedLogs = localStorage.getItem('mock_logs');

    if (savedUsers) users = JSON.parse(savedUsers);
    if (savedProjects) projects = JSON.parse(savedProjects);
    if (savedLogs) systemLogs = JSON.parse(savedLogs);
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
  }
};

// Load persisted data on module init
loadFromLocalStorage();

// ============================================================================
// AUTH METHODS
// ============================================================================

export const auth = {
  async signIn(email: string, password: string) {
    await delay();
    console.log('🔐 Mock Login:', email);

    const user = users.find(u => u.email === email);
    const expectedPassword = getUserPassword(email);

    if (!user || password !== expectedPassword) {
      throw new Error('Invalid login credentials');
    }

    // Update last login
    user.last_login = new Date().toISOString();
    saveToLocalStorage();

    // Store session
    currentUser = user;
    localStorage.setItem('mock_session', JSON.stringify(user));

    // Add login log
    systemLogs.push({
      id: `log-${logIdCounter++}`,
      timestamp: new Date().toISOString(),
      actor_id: user.id,
      actor_name: user.full_name,
      actor_role: user.role,
      action: 'LOGIN',
      details: `User ${user.full_name} logged in`
    });
    saveToLocalStorage();

    return { user, session: { user, access_token: 'mock-token' } };
  },

  async signOut() {
    await delay(100);
    console.log('🚪 Mock Logout');

    if (currentUser) {
      systemLogs.push({
        id: `log-${logIdCounter++}`,
        timestamp: new Date().toISOString(),
        actor_id: currentUser.id,
        actor_name: currentUser.full_name,
        actor_role: currentUser.role,
        action: 'LOGOUT',
        details: `User ${currentUser.full_name} logged out`
      });
      saveToLocalStorage();
    }

    currentUser = null;
    localStorage.removeItem('mock_session');
  },

  async getCurrentUser() {
    const session = localStorage.getItem('mock_session');
    if (session) {
      currentUser = JSON.parse(session);
    }
    return currentUser;
  },

  async getSession() {
    const session = localStorage.getItem('mock_session');
    if (session) {
      const user = JSON.parse(session);
      return { data: { session: { user } }, error: null };
    }
    return { data: { session: null }, error: null };
  },

  async updatePassword(newPassword: string) {
    await delay();
    console.log('🔑 Mock password update (noop)');
    // In mock mode, we don't actually store passwords
    return { error: null };
  },

  async resetPassword(email: string) {
    await delay();
    console.log('📧 Mock password reset email (noop)', email);
    // In mock mode, we just log but don't send email
    return { error: null };
  }
};

// ============================================================================
// USER METHODS
// ============================================================================

export const usersApi = {
  async getAll() {
    await delay();
    return users;
  },

  async getByEmail(email: string) {
    await delay();
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error(`No user found with email: ${email}`);
    }
    return user;
  },

  async getById(id: string) {
    await delay();
    const user = users.find(u => u.id === id);
    if (!user) {
      throw new Error(`No user found with id: ${id}`);
    }
    return user;
  },

  async create(userData: Omit<User, 'id' | 'last_login'>) {
    await delay();
    const newUser: User = {
      id: `user-${userIdCounter++}`,
      ...userData,
      last_login: null
    };
    users.push(newUser);
    saveToLocalStorage();

    // Log user creation
    if (currentUser) {
      systemLogs.push({
        id: `log-${logIdCounter++}`,
        timestamp: new Date().toISOString(),
        actor_id: currentUser.id,
        actor_name: currentUser.full_name,
        actor_role: currentUser.role,
        action: 'USER_CREATED',
        details: `User ${newUser.full_name} created with role ${newUser.role}`
      });
      saveToLocalStorage();
    }

    return newUser;
  },

  async update(id: string, updates: Partial<User>) {
    await delay();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error(`User ${id} not found`);
    }

    users[index] = { ...users[index], ...updates };
    saveToLocalStorage();

    // Log user update
    if (currentUser) {
      systemLogs.push({
        id: `log-${logIdCounter++}`,
        timestamp: new Date().toISOString(),
        actor_id: currentUser.id,
        actor_name: currentUser.full_name,
        actor_role: currentUser.role,
        action: 'USER_UPDATED',
        details: `User ${users[index].full_name} updated`
      });
      saveToLocalStorage();
    }

    return users[index];
  },

  async delete(id: string) {
    await delay();
    const user = users.find(u => u.id === id);
    if (!user) {
      throw new Error(`User ${id} not found`);
    }

    users = users.filter(u => u.id !== id);
    saveToLocalStorage();

    // Log user deletion
    if (currentUser) {
      systemLogs.push({
        id: `log-${logIdCounter++}`,
        timestamp: new Date().toISOString(),
        actor_id: currentUser.id,
        actor_name: currentUser.full_name,
        actor_role: currentUser.role,
        action: 'USER_DELETED',
        details: `User ${user.full_name} (${user.email}) deleted`
      });
      saveToLocalStorage();
    }

    return true;
  }
};

// ============================================================================
// PROJECT METHODS
// ============================================================================

export const projectsApi = {
  async getAll() {
    await delay();
    return projects;
  },

  async getById(id: string) {
    await delay();
    const project = projects.find(p => p.id === id);
    if (!project) {
      throw new Error(`Project ${id} not found`);
    }
    return project;
  },

  async getByRole(role: Role) {
    await delay();
    return projects.filter(p => p.assigned_to_role === role);
  },

  async create(projectData: Omit<Project, 'id' | 'created_at' | 'history'>) {
    await delay();
    const newProject: Project = {
      id: `proj-${projectIdCounter++}`,
      ...projectData,
      created_at: new Date().toISOString(),
      history: []
    };
    projects.push(newProject);
    saveToLocalStorage();

    // Log project creation
    if (currentUser) {
      systemLogs.push({
        id: `log-${logIdCounter++}`,
        timestamp: new Date().toISOString(),
        actor_id: currentUser.id,
        actor_name: currentUser.full_name,
        actor_role: currentUser.role,
        action: 'PROJECT_CREATED',
        details: `Project "${newProject.title}" created`
      });
      saveToLocalStorage();
    }

    return newProject;
  },

  async update(id: string, updates: Partial<Project>) {
    await delay();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Project ${id} not found`);
    }

    projects[index] = { ...projects[index], ...updates };
    saveToLocalStorage();

    // Log project update
    if (currentUser) {
      systemLogs.push({
        id: `log-${logIdCounter++}`,
        timestamp: new Date().toISOString(),
        actor_id: currentUser.id,
        actor_name: currentUser.full_name,
        actor_role: currentUser.role,
        action: 'PROJECT_UPDATED',
        details: `Project "${projects[index].title}" updated`
      });
      saveToLocalStorage();
    }

    return projects[index];
  },

  async delete(id: string) {
    await delay();
    const project = projects.find(p => p.id === id);
    if (!project) {
      throw new Error(`Project ${id} not found`);
    }

    projects = projects.filter(p => p.id !== id);
    saveToLocalStorage();

    return true;
  }
};

// ============================================================================
// SYSTEM LOGS
// ============================================================================

export const logsApi = {
  async getAll() {
    await delay();
    return systemLogs.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  async add(entry: Omit<SystemLog, 'id' | 'timestamp'>) {
    const newLog: SystemLog = {
      id: `log-${logIdCounter++}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    systemLogs.push(newLog);
    saveToLocalStorage();
    return newLog;
  }
};

// ============================================================================
// STORAGE (MOCK)
// ============================================================================

export const storage = {
  async uploadThumbnail(file: File, projectId: string) {
    await delay();
    console.log('📸 Mock thumbnail upload:', file.name);
    return `https://via.placeholder.com/1080x1920/FF6B6B/FFFFFF?text=${encodeURIComponent(file.name)}`;
  },

  async uploadVideo(file: File, projectId: string) {
    await delay();
    console.log('🎥 Mock video upload:', file.name);
    return 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4';
  },

  async uploadCreative(file: File, projectId: string) {
    await delay();
    console.log('🎨 Mock creative upload:', file.name);
    return `https://via.placeholder.com/1080x1080/4ECDC4/FFFFFF?text=${encodeURIComponent(file.name)}`;
  },

  async deleteFile(bucket: string, path: string) {
    await delay();
    console.log('🗑️ Mock file delete:', path);
    return true;
  }
};

// ============================================================================
// MAIN DB EXPORT (API Compatible with supabaseDb.ts)
// ============================================================================

export const db = {
  // Auth - nested for compatibility
  auth: {
    resetPassword: async (email: string) => {
      await delay();
      console.log('📧 Mock password reset (noop)', email);
      return { error: null };
    },
    updatePassword: async (newPassword: string) => {
      await delay();
      console.log('🔑 Mock password update (noop)');
      return { error: null };
    },
    // For AddUser.tsx
    inviteUser: async (email: string, userData: any) => {
      await delay();
      console.log('📧 Mock invite user:', email, userData);
      const newUser = {
        id: `user-${userIdCounter++}`,
        email,
        full_name: userData.full_name,
        role: userData.role,
        phone: userData.phone,
        status: UserStatus.ACTIVE,
        last_login: null
      };
      users.push(newUser);
      saveToLocalStorage();
      return { user: newUser, error: null };
    },
    // For UserManagement.tsx
    deleteUser: async (userId: string) => {
      await delay();
      console.log('🗑️ Mock delete user:', userId);
      const user = users.find(u => u.id === userId);
      users = users.filter(u => u.id !== userId);
      saveToLocalStorage();
      return { error: null };
    }
  },

  // Auth - top level
  async login(email: string, password: string) {
    const result = await auth.signIn(email, password);
    return result.user;
  },

  async logout() {
    await auth.signOut();
  },

  getCurrentUser: () => currentUser,

  async updatePassword(newPassword: string) {
    await auth.updatePassword(newPassword);
  },

  async resetPassword(email: string) {
    await auth.resetPassword(email);
  },

  // Users
  users: usersApi,

  // Projects - nested for components that call db.projects.getAll()
  projects: projectsApi,

  async getUsers() {
    return await usersApi.getAll();
  },

  async addUser(userData: Omit<User, 'id' | 'last_login'>) {
    return await usersApi.create(userData);
  },

  async updateUser(id: string, updates: Partial<User>) {
    await usersApi.update(id, updates);
  },

  async deleteUser(id: string) {
    await usersApi.delete(id);
  },

  async inviteUser(email: string, userData: any) {
    // Mock invite - just create user
    return await usersApi.create({
      email,
      full_name: userData.full_name,
      role: userData.role,
      phone: userData.phone,
      status: UserStatus.ACTIVE
    });
  },

  // Projects
  async getProjects() {
    return await projectsApi.getAll();
  },

  async getProjectById(id: string) {
    return await projectsApi.getById(id);
  },

  async getProjectsByRole(role: Role) {
    return await projectsApi.getByRole(role);
  },

  createProject(title: string, channel: Channel, dueDate: string, contentType: string = 'VIDEO'): Project {
    // Synchronous version for compatibility
    const newProject: Project = {
      id: `proj-${projectIdCounter++}`,
      title,
      channel,
      content_type: contentType as 'VIDEO' | 'CREATIVE_ONLY',
      current_stage: WorkflowStage.SCRIPT,
      assigned_to_role: Role.WRITER,
      status: TaskStatus.TODO,
      priority: 'NORMAL',
      due_date: dueDate,
      created_at: new Date().toISOString(),
      data: {},
      history: []
    };
    projects.push(newProject);
    saveToLocalStorage();
    return newProject;
  },

  async updateProject(id: string, updates: Partial<Project>) {
    return await projectsApi.update(id, updates);
  },

  // Update project data (for writer script updates)
  updateProjectData(projectId: string, data: any) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      project.data = { ...project.data, ...data };
      saveToLocalStorage();
      console.log('📝 Mock updateProjectData:', projectId, data);
    }
  },

  async deleteProject(id: string) {
    await projectsApi.delete(id);
  },

  // Workflow
  async submitToReview(projectId: string) {
    await delay();
    console.log('📝 Mock submit to review:', projectId);
  },

  async advanceWorkflow(projectId: string, comment?: string) {
    await delay();
    console.log('➡️  Mock advance workflow:', projectId);
  },

  // Reject task (for CMO/CEO rejection)
  rejectTask(projectId: string, targetStage: WorkflowStage, comment: string) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      project.current_stage = targetStage;
      project.status = TaskStatus.REJECTED;
      saveToLocalStorage();
      console.log('❌ Mock rejectTask:', projectId, 'to', targetStage, comment);
    }
  },

  // Logs
  async getSystemLogs() {
    return await logsApi.getAll();
  },

  // Storage
  storage,

  // Helpers
  helpers: {
    getNextStage(currentStage: WorkflowStage, contentType: string, action: 'approve' | 'reject') {
      // Mock workflow logic
      return {
        stage: WorkflowStage.PUBLISHED,
        role: Role.OPS
      };
    }
  }
};

export default db;