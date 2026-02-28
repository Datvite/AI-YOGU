/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient, UserRole, ClubStatus, MembershipRole, MembershipStatus } =
  require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: passwordHash,
      role: UserRole.ADMIN
    }
  });

  const students = [];
  for (let i = 1; i <= 10; i++) {
    const student = await prisma.user.create({
      data: {
        name: `Student ${i}`,
        email: `student${i}@example.com`,
        password: passwordHash,
        role: UserRole.STUDENT
      }
    });
    students.push(student);
  }

  const clubPresidents = [];
  for (let i = 1; i <= 3; i++) {
    const president = await prisma.user.create({
      data: {
        name: `Club ${i} President`,
        email: `club${i}@example.com`,
        password: passwordHash,
        role: UserRole.CLUB
      }
    });
    clubPresidents.push(president);
  }

  const clubs = [];
  for (let i = 1; i <= 3; i++) {
    const club = await prisma.club.create({
      data: {
        name: `Sample Club ${i}`,
        slug: `sample-club-${i}`,
        description: `This is sample club ${i}. It is used for demo purposes.`,
        category: i === 1 ? "Sports" : i === 2 ? "Arts" : "Tech",
        logoUrl: null,
        status: ClubStatus.APPROVED,
        schedule: "Weekly meetings",
        presidentId: clubPresidents[i - 1].id
      }
    });
    clubs.push(club);

    await prisma.membership.create({
      data: {
        userId: clubPresidents[i - 1].id,
        clubId: club.id,
        role: MembershipRole.president,
        status: MembershipStatus.accepted
      }
    });
  }

  for (const club of clubs) {
    const randomMembers = students.slice(0, 3);
    for (const student of randomMembers) {
      await prisma.membership.create({
        data: {
          userId: student.id,
          clubId: club.id,
          role: MembershipRole.member,
          status: MembershipStatus.accepted
        }
      });
    }

    await prisma.post.createMany({
      data: [
        {
          title: `${club.name} Kickoff`,
          content: `Welcome to ${club.name}! This is our first announcement.`,
          clubId: club.id,
          authorId: club.presidentId
        },
        {
          title: `${club.name} Weekly Meeting`,
          content: `Join us for our weekly meeting this Friday after school.`,
          clubId: club.id,
          authorId: club.presidentId
        }
      ]
    });
  }

  await prisma.notification.create({
    data: {
      userId: admin.id,
      title: "Welcome",
      message: "Admin account created. Use this dashboard to manage clubs."
    }
  });

  console.log("Seed data created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

