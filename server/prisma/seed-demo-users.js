import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PEOPLE = [
  { name: 'Aarav Sharma', username: 'aarav', email: 'aarav@gupshup.demo', bio: 'Cricket, code and late-night chai.', gender: 'MALE' },
  { name: 'Diya Patel', username: 'diya', email: 'diya@gupshup.demo', bio: 'Design student. DMs about typography welcome.', gender: 'FEMALE' },
  { name: 'Kabir Singh', username: 'kabir', email: 'kabir@gupshup.demo', bio: 'Gym + guitar. Always up for a jam.', gender: 'MALE' },
  { name: 'Ananya Iyer', username: 'ananya', email: 'ananya@gupshup.demo', bio: 'Baking, books and Bangalore weather.', gender: 'FEMALE' },
  { name: 'Rohan Mehta', username: 'rohan', email: 'rohan@gupshup.demo', bio: 'Startup nerd. Ask me about EVs.', gender: 'MALE' },
  { name: 'Sneha Reddy', username: 'sneha', email: 'sneha@gupshup.demo', bio: 'Doctor by day, sketcher by night.', gender: 'FEMALE' },
  { name: 'Arjun Nair', username: 'arjun', email: 'arjun@gupshup.demo', bio: 'Football over everything. Hala Madrid.', gender: 'MALE' },
  { name: 'Priya Verma', username: 'priya', email: 'priya@gupshup.demo', bio: 'Photographer. Golden hour chaser.', gender: 'FEMALE' },
];

for (const p of PEOPLE) {
  const passwordHash = await bcrypt.hash('password123', 12);
  await prisma.user.upsert({
    where: { username: p.username },
    update: { name: p.name, bio: p.bio, gender: p.gender },
    create: { ...p, passwordHash },
  });
  console.log('upserted', p.username);
}
await prisma.$disconnect();
console.log('done');
