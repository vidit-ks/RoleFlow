import { pool } from '../config/db.js';
import { hashPassword } from '../utils/password.js';

async function runSeed() {
  console.log('🌱 Starting database seeding with realistic demo data...');
  try {
    const demoPasswordHash = await hashPassword('RoleflowDemo123!');

    // 1. Clear existing data
    await pool.query(`
      DELETE FROM activity_logs;
      DELETE FROM comments;
      DELETE FROM tasks;
      DELETE FROM team_members;
      DELETE FROM teams;
      DELETE FROM users;
    `);

    console.log('🧹 Cleaned existing tables.');

    // 2. Insert Users
    const users = [
      {
        name: 'Priya Mehta',
        email: 'admin@roleflow.demo',
        role: 'admin',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Aarav Sharma',
        email: 'manager@roleflow.demo',
        role: 'manager',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Rahul Verma',
        email: 'employee@roleflow.demo',
        role: 'employee',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@roleflow.demo',
        role: 'manager',
        avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Ananya Singh',
        email: 'ananya.singh@roleflow.demo',
        role: 'employee',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Rohan Gupta',
        email: 'rohan.gupta@roleflow.demo',
        role: 'employee',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Neha Iyer',
        email: 'neha.iyer@roleflow.demo',
        role: 'employee',
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Vikram Patel',
        email: 'vikram.patel@roleflow.demo',
        role: 'employee',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
      }
    ];

    const userMap = {};
    for (const u of users) {
      const res = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, avatar_url, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING id, name, email, role`,
        [u.name, u.email, demoPasswordHash, u.role, u.avatar_url]
      );
      userMap[u.email] = res.rows[0];
    }
    console.log(`👤 Inserted ${users.length} users.`);

    // 3. Insert Teams
    const engineeringTeamRes = await pool.query(
      `INSERT INTO teams (name, description, manager_id)
       VALUES ($1, $2, $3) RETURNING id, name`,
      ['Engineering', 'Core platform backend, APIs, frontend architecture and infrastructure', userMap['manager@roleflow.demo'].id]
    );
    const engTeam = engineeringTeamRes.rows[0];

    const designTeamRes = await pool.query(
      `INSERT INTO teams (name, description, manager_id)
       VALUES ($1, $2, $3) RETURNING id, name`,
      ['Product & Design', 'UI/UX design systems, user research and product workflows', userMap['sneha.reddy@roleflow.demo'].id]
    );
    const designTeam = designTeamRes.rows[0];

    const marketingTeamRes = await pool.query(
      `INSERT INTO teams (name, description, manager_id)
       VALUES ($1, $2, $3) RETURNING id, name`,
      ['Marketing & Growth', 'Growth campaigns, product marketing and customer acquisition', userMap['manager@roleflow.demo'].id]
    );
    const mktgTeam = marketingTeamRes.rows[0];

    console.log('🏢 Inserted teams.');

    // 4. Team Members
    const teamMembers = [
      { team_id: engTeam.id, user_id: userMap['manager@roleflow.demo'].id },
      { team_id: engTeam.id, user_id: userMap['employee@roleflow.demo'].id },
      { team_id: engTeam.id, user_id: userMap['ananya.singh@roleflow.demo'].id },
      { team_id: engTeam.id, user_id: userMap['vikram.patel@roleflow.demo'].id },

      { team_id: designTeam.id, user_id: userMap['sneha.reddy@roleflow.demo'].id },
      { team_id: designTeam.id, user_id: userMap['rohan.gupta@roleflow.demo'].id },

      { team_id: mktgTeam.id, user_id: userMap['neha.iyer@roleflow.demo'].id }
    ];

    for (const tm of teamMembers) {
      await pool.query(
        `INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [tm.team_id, tm.user_id]
      );
    }
    console.log(`👥 Assigned ${teamMembers.length} team members.`);

    // 5. Insert Tasks
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const in3Days = new Date(today);
    in3Days.setDate(today.getDate() + 3);
    const in7Days = new Date(today);
    in7Days.setDate(today.getDate() + 7);

    const tasks = [
      {
        title: 'Implement JWT authentication & RBAC API',
        description: 'Set up Express middleware with JWT verification, password hashing with bcrypt, and role authorization for Admin, Manager, and Employee.',
        team_id: engTeam.id,
        assigned_to: userMap['employee@roleflow.demo'].id,
        created_by: userMap['manager@roleflow.demo'].id,
        status: 'in_progress',
        priority: 'high',
        due_date: tomorrow.toISOString().split('T')[0]
      },
      {
        title: 'Fix payment webhook timeout issue',
        description: 'Debug idempotency check and database connection pooling timeout during burst webhook spikes.',
        team_id: engTeam.id,
        assigned_to: userMap['ananya.singh@roleflow.demo'].id,
        created_by: userMap['manager@roleflow.demo'].id,
        status: 'todo',
        priority: 'high',
        due_date: today.toISOString().split('T')[0]
      },
      {
        title: 'Optimize PostgreSQL query execution plans',
        description: 'Add indexes on foreign keys, audit logs created_at, and optimize task search filter performance.',
        team_id: engTeam.id,
        assigned_to: userMap['employee@roleflow.demo'].id,
        created_by: userMap['manager@roleflow.demo'].id,
        status: 'completed',
        priority: 'medium',
        due_date: today.toISOString().split('T')[0]
      },
      {
        title: 'Design onboarding flow & wireframes',
        description: 'Create interactive Figma prototypes for new user invite and team workspace setup.',
        team_id: designTeam.id,
        assigned_to: userMap['rohan.gupta@roleflow.demo'].id,
        created_by: userMap['sneha.reddy@roleflow.demo'].id,
        status: 'in_progress',
        priority: 'medium',
        due_date: in3Days.toISOString().split('T')[0]
      },
      {
        title: 'Conduct user research for role switching',
        description: 'Interview 5 managers regarding their daily task assignment workflows and pain points.',
        team_id: designTeam.id,
        assigned_to: userMap['rohan.gupta@roleflow.demo'].id,
        created_by: userMap['sneha.reddy@roleflow.demo'].id,
        status: 'completed',
        priority: 'low',
        due_date: in7Days.toISOString().split('T')[0]
      },
      {
        title: 'Launch Q4 Product Roadmap Announcement',
        description: 'Prepare email newsletter campaign and publish changelog updates for enterprise customers.',
        team_id: mktgTeam.id,
        assigned_to: userMap['neha.iyer@roleflow.demo'].id,
        created_by: userMap['manager@roleflow.demo'].id,
        status: 'todo',
        priority: 'medium',
        due_date: in7Days.toISOString().split('T')[0]
      }
    ];

    const insertedTasks = [];
    for (const t of tasks) {
      const res = await pool.query(
        `INSERT INTO tasks (title, description, team_id, assigned_to, created_by, status, priority, due_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [t.title, t.description, t.team_id, t.assigned_to, t.created_by, t.status, t.priority, t.due_date]
      );
      insertedTasks.push(res.rows[0]);
    }
    console.log(`📋 Inserted ${insertedTasks.length} tasks.`);

    // 6. Insert Comments
    const comments = [
      {
        task_id: insertedTasks[0].id,
        user_id: userMap['manager@roleflow.demo'].id,
        content: 'Please make sure public registration always defaults strictly to Employee role.'
      },
      {
        task_id: insertedTasks[0].id,
        user_id: userMap['employee@roleflow.demo'].id,
        content: 'JWT token signing and RBAC middleware tests are verified. Working on refresh handler now.'
      },
      {
        task_id: insertedTasks[1].id,
        user_id: userMap['ananya.singh@roleflow.demo'].id,
        content: 'Identified the issue in connection pool limit exhaustion. Applying fix and testing with k6.'
      },
      {
        task_id: insertedTasks[3].id,
        user_id: userMap['rohan.gupta@roleflow.demo'].id,
        content: 'Updated dark-mode dashboard components and sent link for review.'
      }
    ];

    for (const c of comments) {
      await pool.query(
        `INSERT INTO comments (task_id, user_id, content) VALUES ($1, $2, $3)`,
        [c.task_id, c.user_id, c.content]
      );
    }
    console.log(`💬 Inserted ${comments.length} comments.`);

    // 7. Insert Activity Logs
    const activities = [
      {
        user_id: userMap['admin@roleflow.demo'].id,
        action: 'USER_CREATED',
        entity_type: 'user',
        entity_id: userMap['employee@roleflow.demo'].id,
        metadata: { user_name: 'Rahul Verma', email: 'employee@roleflow.demo', role: 'employee' }
      },
      {
        user_id: userMap['manager@roleflow.demo'].id,
        action: 'TASK_CREATED',
        entity_type: 'task',
        entity_id: insertedTasks[0].id,
        metadata: { task_title: 'Implement JWT authentication & RBAC API', priority: 'high', assigned_to_name: 'Rahul Verma' }
      },
      {
        user_id: userMap['employee@roleflow.demo'].id,
        action: 'TASK_STATUS_CHANGED',
        entity_type: 'task',
        entity_id: insertedTasks[0].id,
        metadata: { task_title: 'Implement JWT authentication & RBAC API', old_status: 'todo', new_status: 'in_progress' }
      },
      {
        user_id: userMap['sneha.reddy@roleflow.demo'].id,
        action: 'TEAM_MEMBER_ADDED',
        entity_type: 'team',
        entity_id: designTeam.id,
        metadata: { team_name: 'Product & Design', member_name: 'Rohan Gupta' }
      },
      {
        user_id: userMap['employee@roleflow.demo'].id,
        action: 'TASK_STATUS_CHANGED',
        entity_type: 'task',
        entity_id: insertedTasks[2].id,
        metadata: { task_title: 'Optimize PostgreSQL query execution plans', old_status: 'in_progress', new_status: 'completed' }
      }
    ];

    for (const a of activities) {
      await pool.query(
        `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        [a.user_id, a.action, a.entity_type, a.entity_id, JSON.stringify(a.metadata)]
      );
    }
    console.log(`📜 Inserted ${activities.length} activity audit logs.`);

    console.log('✅ Database seeded successfully with demo credentials:');
    console.log('   👑 Admin:    admin@roleflow.demo    / RoleflowDemo123!');
    console.log('   👔 Manager:  manager@roleflow.demo  / RoleflowDemo123!');
    console.log('   💻 Employee: employee@roleflow.demo / RoleflowDemo123!');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();
