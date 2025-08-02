import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');

    // Clear existing data in the correct order (due to foreign key constraints)
    console.log('🧹 Clearing existing data...');
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Existing data cleared');

    // Create sample users
    const users = [
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@connecthub.com',
        bio: 'Full Stack Developer | React & Node.js Enthusiast | Building the future one line of code at a time 🚀',
        password: await bcrypt.hash('password123', 12)
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@connecthub.com',
        bio: 'Product Manager at TechCorp | AI & Machine Learning Advocate | Turning ideas into reality',
        password: await bcrypt.hash('password123', 12)
      },
      {
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@connecthub.com',
        bio: 'UX/UI Designer | Creating beautiful and intuitive digital experiences | Design thinking enthusiast',
        password: await bcrypt.hash('password123', 12)
      },
      {
        name: 'David Kim',
        email: 'david.kim@connecthub.com',
        bio: 'DevOps Engineer | Cloud Architecture Specialist | Kubernetes & Docker Expert | AWS Certified',
        password: await bcrypt.hash('password123', 12)
      },
      {
        name: 'Jessica Williams',
        email: 'jessica.williams@connecthub.com',
        bio: 'Data Scientist | Python & R Developer | Turning data into insights | Machine Learning Researcher',
        password: await bcrypt.hash('password123', 12)
      },
      {
        name: 'Alex Thompson',
        email: 'demo@connecthub.com',
        bio: 'Demo Account | Try out ConnectHub features | Welcome to our community! 🎉',
        password: await bcrypt.hash('demo123', 12)
      }
    ];

    // Create users
    const createdUsers = [];
    for (const userData of users) {
      const user = await prisma.user.create({
        data: userData
      });
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.name}`);
    }

    // Create sample posts
    const posts = [
      {
        authorId: createdUsers[0].id, // Sarah Johnson
        content: `🎉 Excited to share that I just completed my first full-stack application using React and Node.js! 

The learning journey has been incredible, and I'm amazed by how much you can accomplish with these technologies. From building responsive UIs to creating robust APIs, every day brings new challenges and victories.

Special thanks to the amazing developer community for all the support and resources. Looking forward to contributing back! 

#WebDevelopment #React #NodeJS #FullStack #LearningJourney`
      },
      {
        authorId: createdUsers[1].id, // Michael Chen
        content: `🚀 Just finished an amazing sprint planning session with our development team!

Key highlights from this quarter:
• Implementing AI-powered features to enhance user experience
• Reducing app load time by 40% through optimization
• Launching our mobile app beta version next month

The synergy between product and engineering teams has been phenomenal. When everyone is aligned on the vision, magic happens! ✨

What's your experience with cross-functional collaboration? Would love to hear your thoughts!

#ProductManagement #Agile #TeamWork #AI #MobileApp`
      },
      {
        authorId: createdUsers[2].id, // Emily Rodriguez
        content: `🎨 Design insight of the day: Simplicity is the ultimate sophistication!

Working on a new design system for our platform and I'm constantly reminded that the best user experiences are invisible. When users can achieve their goals effortlessly, that's when you know you've nailed the design.

Some principles I live by:
1. User empathy comes first
2. Consistency builds trust
3. Accessibility is not optional
4. Test early, test often

What design principles guide your work? 

#UXDesign #DesignThinking #UserExperience #DesignSystems #Accessibility`
      },
      {
        authorId: createdUsers[3].id, // David Kim
        content: `☁️ Successfully migrated our entire infrastructure to Kubernetes this month!

The results speak for themselves:
• 99.9% uptime achieved
• 60% reduction in deployment time
• Automatic scaling during peak hours
• Cost optimization through resource management

The journey wasn't without challenges, but having a solid containerization strategy made all the difference. Docker + Kubernetes = Infrastructure excellence! 🐳

Shoutout to my DevOps team for making this seamless transition possible.

#DevOps #Kubernetes #Docker #CloudComputing #Infrastructure #AWS`
      },
      {
        authorId: createdUsers[4].id, // Jessica Williams
        content: `📊 Data Science breakthrough: Our predictive model achieved 94% accuracy!

After months of feature engineering and model optimization, we've developed a machine learning system that can predict customer behavior with remarkable precision.

The process involved:
🔸 Data collection from multiple sources
🔸 Extensive data cleaning and preprocessing
🔸 Feature selection using statistical methods
🔸 Model training with ensemble techniques
🔸 Cross-validation and hyperparameter tuning

This will revolutionize how we approach customer engagement and personalization. The power of data never ceases to amaze me! 

#DataScience #MachineLearning #PredictiveAnalytics #Python #AI #BigData`
      },
      {
        authorId: createdUsers[5].id, // Alex Thompson (Demo)
        content: `👋 Welcome to ConnectHub - your new professional networking platform!

I'm the demo account, here to show you around. This platform offers:

✨ Professional networking
✨ Content sharing and engagement
✨ Real-time updates
✨ Mobile-responsive design
✨ Secure user authentication

Feel free to explore all features:
• Create your own posts
• Update your profile
• Connect with other professionals
• Share your professional journey

Ready to start networking? Let's connect! 🤝

#Welcome #ConnectHub #Networking #Demo #GetStarted`
      },
      {
        authorId: createdUsers[0].id, // Sarah Johnson
        content: `💡 Pro tip for fellow developers: Always write code like the person maintaining it is a violent psychopath who knows where you live! 😄

But seriously, clean, well-documented code is a love letter to your future self and your teammates. Here's what I've learned:

1. Meaningful variable names > clever abbreviations
2. Comments explain WHY, not what
3. Small, focused functions are your friends
4. Consistent formatting matters
5. Code reviews are gifts, not criticism

What are your favorite coding best practices?

#CleanCode #BestPractices #SoftwareDevelopment #CodeQuality #DeveloperTips`
      },
      {
        authorId: createdUsers[1].id, // Michael Chen
        content: `🎯 Product Management lesson: Fall in love with the problem, not the solution!

This week we pivoted our approach after discovering our initial solution wasn't addressing the core user pain point. It's humbling but exciting when user research redirects your entire strategy.

Key learnings:
• User interviews reveal hidden insights
• Assumptions are dangerous without validation
• Iteration beats perfection every time
• Data-driven decisions reduce bias

Sometimes the best feature is the one you don't build. Focus on what truly matters to your users! 

#ProductManagement #UserResearch #Pivot #DataDriven #UserFirst`
      }
    ];

    // Create posts
    for (const postData of posts) {
      const post = await prisma.post.create({
        data: postData,
        include: {
          author: {
            select: {
              name: true
            }
          }
        }
      });
      console.log(`✅ Created post by: ${post.author.name}`);
    }

    console.log('🎉 Database seeded successfully!');
    console.log(`📊 Created ${createdUsers.length} users and ${posts.length} posts`);
    console.log('\n🔐 Demo Account Credentials:');
    console.log('Email: demo@connecthub.com');
    console.log('Password: demo123');
    console.log('\n🔐 Other User Credentials:');
    console.log('Password for all users: password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
