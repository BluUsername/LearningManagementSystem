import { useState } from 'react';
import {
  Container, Typography, Box, Paper, Accordion, AccordionSummary,
  AccordionDetails, Chip, Grid,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  HelpOutline as HelpIcon,
  School as SchoolIcon,
  PersonAdd as PersonAddIcon,
  MenuBook as MenuBookIcon,
  Security as SecurityIcon,
  SupportAgent as SupportIcon,
  Lightbulb as TipIcon,
} from '@mui/icons-material';

const faqCategories = [
  {
    category: 'Getting Started',
    icon: PersonAddIcon,
    color: '#42a5f5',
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click the "Register" button on the home page. Choose your role (Student or Teacher), fill in your details, and you\'re ready to go! Registration is free and only takes a few seconds.',
      },
      {
        q: 'What\'s the difference between a Student and Teacher account?',
        a: 'Students can browse and enrol in courses, track their progress, and earn achievements. Teachers can create and manage their own courses, as well as see how many students have enrolled. Both roles have access to the leaderboard, profile, and community features.',
      },
      {
        q: 'Can I change my role after registering?',
        a: 'Role changes are managed by administrators. If you need to switch from Student to Teacher (or vice versa), please contact an admin who can update your role from the User Management panel.',
      },
    ],
  },
  {
    category: 'Courses',
    icon: MenuBookIcon,
    color: '#ab47bc',
    questions: [
      {
        q: 'How do I enrol in a course?',
        a: 'Navigate to the Courses page, find a course you\'re interested in, and click the "Enroll" button. You\'ll immediately be added to the course and it will appear on your dashboard.',
      },
      {
        q: 'Can I unenrol from a course?',
        a: 'Yes! Go to the course detail page and click "Unenroll". You can always re-enrol later if you change your mind.',
      },
      {
        q: 'How do I create a course as a teacher?',
        a: 'From your Teacher Dashboard, click "Create Course". Fill in the course title and description, then click submit. Your course will be immediately available for students to discover and enrol in.',
      },
      {
        q: 'Is there a limit to how many courses I can enrol in?',
        a: 'No limits! You can enrol in as many courses as you like. In fact, enrolling in more courses helps you unlock achievements like "Knowledge Seeker" and "Lifelong Learner".',
      },
    ],
  },
  {
    category: 'Account & Profile',
    icon: SecurityIcon,
    color: '#f57c00',
    questions: [
      {
        q: 'How do I update my profile?',
        a: 'Head to your Profile page from the navigation bar. You can update your first name, last name, and bio. Click "Save Changes" to keep your updates.',
      },
      {
        q: 'How do I change my password?',
        a: 'Password changes are not currently available through the app interface. Please contact an administrator if you need to reset your password.',
      },
      {
        q: 'Is my data secure?',
        a: 'Absolutely. LearnHub uses token-based authentication to protect your account. All API communications are encrypted, and passwords are securely hashed — they\'re never stored in plain text.',
      },
    ],
  },
  {
    category: 'Features & Tips',
    icon: TipIcon,
    color: '#66bb6a',
    questions: [
      {
        q: 'What are Achievements?',
        a: 'Achievements are badges you earn by reaching milestones on LearnHub — like enrolling in your first course, completing your profile, or creating courses as a teacher. Visit the Achievements page to see which ones you\'ve unlocked!',
      },
      {
        q: 'How does the Leaderboard work?',
        a: 'The Leaderboard ranks courses by popularity (number of enrolled students) and teachers by their total student count. It\'s a fun way to discover the most popular content on the platform.',
      },
      {
        q: 'Can I switch between dark and light mode?',
        a: 'Yes! Click the sun/moon icon in the navigation bar to toggle between dark and light themes. Your preference is saved automatically and will be remembered next time you visit.',
      },
    ],
  },
];

const tips = [
  { text: 'Complete your profile bio to unlock the "Identity Established" achievement!', color: '#42a5f5' },
  { text: 'Enrol in 5+ courses to earn the "Lifelong Learner" badge.', color: '#ab47bc' },
  { text: 'Teachers: creating 3+ courses unlocks "Prolific Educator"!', color: '#f57c00' },
  { text: 'Check the Leaderboard regularly to see trending courses.', color: '#66bb6a' },
];

function HelpFAQ() {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (_, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      {/* Hero Banner */}
      <Paper elevation={0} sx={{
        p: 4, mb: 4, borderRadius: 3, position: 'relative', overflow: 'hidden',
        backgroundImage: `
          linear-gradient(135deg, rgba(26, 35, 126, 0.92) 0%, rgba(21, 101, 192, 0.85) 50%, rgba(102, 187, 106, 0.8) 100%),
          url('https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1400&q=80')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1.5 }}>
            <HelpIcon sx={{ fontSize: 36 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Help & FAQ
            </Typography>
          </Box>
          <Typography variant="subtitle1" sx={{ opacity: 0.85, mb: 2 }}>
            Find answers to common questions and get the most out of LearnHub.
          </Typography>
          <Chip
            icon={<SupportIcon sx={{ color: '#fff !important' }} />}
            label={`${faqCategories.reduce((sum, c) => sum + c.questions.length, 0)} Questions Answered`}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(8px)',
            }}
          />
        </Box>
      </Paper>

      {/* Quick Tips */}
      <Paper elevation={0} sx={{
        p: 3, mb: 4, borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(102, 187, 106, 0.08) 0%, rgba(66, 165, 245, 0.06) 100%)',
        border: '1px solid rgba(102, 187, 106, 0.15)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TipIcon sx={{ color: '#66bb6a' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Quick Tips</Typography>
        </Box>
        <Grid container spacing={2}>
          {tips.map((tip, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box sx={{
                p: 2, borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: `1px solid ${tip.color}25`,
                display: 'flex', alignItems: 'flex-start', gap: 1.5,
              }}>
                <Box sx={{
                  width: 8, height: 8, borderRadius: '50%',
                  backgroundColor: tip.color,
                  mt: 0.8, flexShrink: 0,
                }} />
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  {tip.text}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* FAQ Sections */}
      {faqCategories.map((category) => {
        const Icon = category.icon;
        return (
          <Box key={category.category} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Icon sx={{ fontSize: 28, color: category.color }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                {category.category}
              </Typography>
            </Box>

            {category.questions.map((item, index) => {
              const panelId = `${category.category}-${index}`;
              return (
                <Accordion
                  key={panelId}
                  expanded={expanded === panelId}
                  onChange={handleChange(panelId)}
                  elevation={0}
                  sx={{
                    mb: 1,
                    borderRadius: '12px !important',
                    border: `1px solid ${expanded === panelId ? `${category.color}40` : 'rgba(255,255,255,0.08)'}`,
                    background: expanded === panelId
                      ? `linear-gradient(135deg, ${category.color}08, ${category.color}04)`
                      : 'rgba(255,255,255,0.02)',
                    '&:before': { display: 'none' },
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: category.color }} />}
                    sx={{ minHeight: 56 }}
                  >
                    <Typography sx={{ fontWeight: 600 }}>{item.q}</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                      {item.a}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        );
      })}

      {/* Contact Section */}
      <Paper elevation={0} sx={{
        p: 4, borderRadius: 3, textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(21, 101, 192, 0.1) 0%, rgba(123, 31, 162, 0.08) 100%)',
        border: '1px solid rgba(66, 165, 245, 0.15)',
      }}>
        <SupportIcon sx={{ fontSize: 48, color: '#42a5f5', mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Still Have Questions?
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 500, mx: 'auto' }}>
          Can't find what you're looking for? Reach out to the LearnHub team and we'll be happy to help.
          Email us at <strong style={{ color: '#42a5f5' }}>support@learnhub.com</strong>
        </Typography>
      </Paper>
    </Container>
  );
}

export default HelpFAQ;
