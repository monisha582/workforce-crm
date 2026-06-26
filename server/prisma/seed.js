import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const departmentDefinitions = [
    { name: 'Engineering', description: 'Software development team', head: 'John Smith' },
    { name: 'HR', description: 'Human Resources', head: 'Sarah Johnson' },
    { name: 'Operations', description: 'Operations & Logistics', head: 'Mike Brown' },
    { name: 'Sales', description: 'Sales & Business Development', head: 'Emma Wilson' },
  ];

  const departments = await Promise.all(
    departmentDefinitions.map((department) =>
      prisma.department.upsert({
        where: { name: department.name },
        update: {
          description: department.description,
          head: department.head,
        },
        create: {
          name: department.name,
          description: department.description,
          head: department.head,
        },
      })
    )
  );

  console.log('✅ Ensured departments exist');

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@workforce.com' },
    update: {
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      departmentId: departments[0].id,
      isActive: true,
    },
    create: {
      email: 'admin@workforce.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      departmentId: departments[0].id,
      isActive: true,
    },
  });

  const hr = await prisma.user.upsert({
    where: { email: 'hr@workforce.com' },
    update: {
      password: hashedPassword,
      firstName: 'HR',
      lastName: 'Manager',
      role: 'HR',
      departmentId: departments[1].id,
      isActive: true,
    },
    create: {
      email: 'hr@workforce.com',
      password: hashedPassword,
      firstName: 'HR',
      lastName: 'Manager',
      role: 'HR',
      departmentId: departments[1].id,
      isActive: true,
    },
  });

  const teamLead = await prisma.user.upsert({
    where: { email: 'lead@workforce.com' },
    update: {
      password: hashedPassword,
      firstName: 'Team',
      lastName: 'Lead',
      role: 'TEAM_LEAD',
      departmentId: departments[0].id,
      isActive: true,
    },
    create: {
      email: 'lead@workforce.com',
      password: hashedPassword,
      firstName: 'Team',
      lastName: 'Lead',
      role: 'TEAM_LEAD',
      departmentId: departments[0].id,
      isActive: true,
    },
  });

  const employees = await Promise.all([
    prisma.user.create({
      data: {
        email: 'emp1@workforce.com',
        password: hashedPassword,
        firstName: 'Alice',
        lastName: 'Smith',
        role: 'EMPLOYEE',
        departmentId: departments[0].id,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'emp2@workforce.com',
        password: hashedPassword,
        firstName: 'Bob',
        lastName: 'Johnson',
        role: 'EMPLOYEE',
        departmentId: departments[0].id,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'emp3@workforce.com',
        password: hashedPassword,
        firstName: 'Charlie',
        lastName: 'Brown',
        role: 'EMPLOYEE',
        departmentId: departments[2].id,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'emp4@workforce.com',
        password: hashedPassword,
        firstName: 'Diana',
        lastName: 'Davis',
        role: 'EMPLOYEE',
        departmentId: departments[3].id,
        isActive: true,
      },
    }),
  ]);

  const intern = await prisma.user.create({
    data: {
      email: 'intern@workforce.com',
      password: hashedPassword,
      firstName: 'Eve',
      lastName: 'Wilson',
      role: 'INTERN',
      departmentId: departments[0].id,
      isActive: true,
    },
  });

  console.log('✅ Created 8 users');

  // Create performance records
  const now = new Date();
  await Promise.all([
    superAdmin,
    hr,
    teamLead,
    ...employees,
    intern,
  ].map((user) =>
    prisma.performance.create({
      data: {
        userId: user.id,
        attendanceScore: Math.random() * 30,
        taskScore: Math.random() * 40,
        deadlineScore: Math.random() * 20,
        qualityScore: Math.random() * 10,
        totalScore: Math.random() * 100,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    })
  ));

  console.log('✅ Created performance records');

  // Create attendance records
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    await Promise.all([
      ...employees.map((emp) =>
        prisma.attendance.create({
          data: {
            userId: emp.id,
            date,
            status: Math.random() > 0.1 ? 'PRESENT' : 'ABSENT',
            checkInTime: new Date(date.getTime() + 9 * 60 * 60 * 1000),
            checkOutTime: new Date(date.getTime() + 18 * 60 * 60 * 1000),
            workingHours: 8,
          },
        })
      ),
    ]);
  }

  console.log('✅ Created 30 days of attendance records');

  // Create tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Design landing page',
        description: 'Create modern landing page design',
        assigneeId: employees[0].id,
        createdBy: teamLead.id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        estimatedHours: 16,
        qualityRating: 4,
      },
    }),
    prisma.task.create({
      data: {
        title: 'API integration',
        description: 'Integrate payment gateway API',
        assigneeId: employees[1].id,
        createdBy: teamLead.id,
        status: 'PENDING',
        priority: 'URGENT',
        dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        estimatedHours: 8,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Database optimization',
        description: 'Optimize database queries',
        assigneeId: employees[2].id,
        createdBy: teamLead.id,
        status: 'COMPLETED',
        priority: 'MEDIUM',
        completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        estimatedHours: 12,
        actualHours: 11,
        qualityRating: 5,
      },
    }),
  ]);

  console.log('✅ Created 3 tasks');

  // Create projects
  const project = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      description: 'Build cross-platform mobile application',
      status: 'IN_PROGRESS',
      startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      leadId: teamLead.id,
      budget: 50000,
      progress: 45,
    },
  });

  // Add team members
  await Promise.all([
    ...employees.map((emp) =>
      prisma.teamMember.create({
        data: {
          projectId: project.id,
          memberId: emp.id,
          role: 'Developer',
        },
      })
    ),
  ]);

  // Create milestones
  await Promise.all([
    prisma.milestone.create({
      data: {
        projectId: project.id,
        name: 'UI Design Complete',
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: 'COMPLETED',
        completedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.milestone.create({
      data: {
        projectId: project.id,
        name: 'Backend Development',
        dueDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
        status: 'IN_PROGRESS',
      },
    }),
  ]);

  console.log('✅ Created 1 project with 4 team members and 2 milestones');

  // Create channels
  const channels = await Promise.all([
    prisma.channel.create({
      data: {
        name: 'announcements',
        description: 'Company announcements',
        departmentId: departments[0].id,
        isPrivate: false,
      },
    }),
    prisma.channel.create({
      data: {
        name: 'engineering',
        description: 'Engineering team discussions',
        departmentId: departments[0].id,
        isPrivate: false,
      },
    }),
  ]);

  console.log('✅ Created 2 channels');

  // Create chat rooms
  const chatRoom = await prisma.chatRoom.create({
    data: {
      name: 'General',
      type: 'CHANNEL',
      createdById: superAdmin.id,
      members: [superAdmin.id, hr.id, teamLead.id],
      channelId: channels[0].id,
    },
  });

  // Create messages
  await Promise.all([
    prisma.message.create({
      data: {
        chatRoomId: chatRoom.id,
        senderId: superAdmin.id,
        content: 'Welcome to Workforce CRM! Please read our company policies.',
      },
    }),
    prisma.message.create({
      data: {
        chatRoomId: chatRoom.id,
        senderId: teamLead.id,
        content: 'Looking forward to working with everyone!',
      },
    }),
  ]);

  console.log('✅ Created chat room with messages');

  // Create announcements
  await prisma.announcement.create({
    data: {
      title: 'System Maintenance',
      content: 'System maintenance scheduled for tonight from 11 PM to 1 AM',
      channelId: channels[0].id,
      priority: 'HIGH',
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Created announcements');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Super Admin: admin@workforce.com / Password123!');
  console.log('HR Manager: hr@workforce.com / Password123!');
  console.log('Team Lead: lead@workforce.com / Password123!');
  console.log('Employee: emp1@workforce.com / Password123!');
  console.log('Intern: intern@workforce.com / Password123!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
