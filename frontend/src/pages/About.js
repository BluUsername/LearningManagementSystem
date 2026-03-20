import { Link as RouterLink } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Grid, Button,
} from '@mui/material';
import {
  Groups as GroupsIcon,
  TrendingUp as TrendingUpIcon,
  Favorite as FavoriteIcon,
  Accessibility as AccessibilityIcon,
  Handshake as HandshakeIcon,
  EmojiEvents as ExcellenceIcon,
  Lightbulb as InnovationIcon,
  PersonAdd as PersonAddIcon,
  MenuBook as MenuBookIcon,
  Rocket as RocketIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  AutoStories as CoursesIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

const missionCards = [
  {
    icon: GroupsIcon,
    title: 'Learn Together',
    description: 'Education is better shared. Join a vibrant community of learners who support, challenge, and inspire each other on the path to knowledge.',
    color: '#42a5f5',
  },
  {
    icon: TrendingUpIcon,
    title: 'Grow Your Skills',
    description: 'Whether you are picking up a new hobby or advancing your career, LearnHub gives you the tools and courses to reach your full potential.',
    color: '#ab47bc',
  },
  {
    icon: FavoriteIcon,
    title: 'Build Community',
    description: 'More than a platform — a place where students and teachers connect, collaborate, and build lasting relationships through learning.',
    color: '#f57c00',
  },
];

const steps = [
  {
    number: 1,
    icon: PersonAddIcon,
    title: 'Create Your Account',
    description: 'Sign up as a student to start learning, or as a teacher to share your expertise with the world.',
  },
  {
    number: 2,
    icon: MenuBookIcon,
    title: 'Explore & Enrol',
    description: 'Browse a growing catalogue of courses. Students can enrol instantly; teachers can create and publish their own.',
  },
  {
    number: 3,
    icon: RocketIcon,
    title: 'Learn, Grow & Connect',
    description: 'Dive into course materials, track your progress, and connect with a community of passionate learners and educators.',
  },
];

const values = [
  {
    icon: AccessibilityIcon,
    title: 'Accessibility',
    description: 'Education should be available to everyone, everywhere, regardless of background or circumstance.',
    gradient: 'linear-gradient(135deg, rgba(66, 165, 245, 0.15), rgba(66, 165, 245, 0.05))',
    borderColor: 'rgba(66, 165, 245, 0.3)',
  },
  {
    icon: HandshakeIcon,
    title: 'Collaboration',
    description: 'The best learning happens when people come together, share ideas, and lift each other up.',
    gradient: 'linear-gradient(135deg, rgba(171, 71, 188, 0.15), rgba(171, 71, 188, 0.05))',
    borderColor: 'rgba(171, 71, 188, 0.3)',
  },
  {
    icon: ExcellenceIcon,
    title: 'Excellence',
    description: 'We hold ourselves to the highest standards so that every course, every feature, and every interaction is exceptional.',
    gradient: 'linear-gradient(135deg, rgba(245, 124, 0, 0.15), rgba(245, 124, 0, 0.05))',
    borderColor: 'rgba(245, 124, 0, 0.3)',
  },
  {
    icon: InnovationIcon,
    title: 'Innovation',
    description: 'We embrace new ideas, modern technology, and creative approaches to make learning more engaging and effective.',
    gradient: 'linear-gradient(135deg, rgba(102, 187, 106, 0.15), rgba(102, 187, 106, 0.05))',
    borderColor: 'rgba(102, 187, 106, 0.3)',
  },
];

const stats = [
  { icon: PeopleIcon, value: '500+', label: 'Learners', color: '#42a5f5' },
  { icon: CoursesIcon, value: '50+', label: 'Courses', color: '#ab47bc' },
  { icon: SchoolIcon, value: '30+', label: 'Teachers', color: '#f57c00' },
  { icon: ExcellenceIcon, value: '95%', label: 'Satisfaction', color: '#66bb6a' },
];

function About() {
  return (
    <Box>
      {/* ── Hero Banner ── */}
      <Paper elevation={0} sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 0,
        py: { xs: 10, md: 14 },
        px: 4,
        backgroundImage: `
          linear-gradient(160deg, rgba(10, 14, 39, 0.88) 0%, rgba(26, 31, 78, 0.8) 35%, rgba(123, 31, 162, 0.75) 65%, rgba(21, 101, 192, 0.85) 100%),
          url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        textAlign: 'center',
        color: 'white',
      }}>
        {/* Decorative circles */}
        <Box sx={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123, 31, 162, 0.25) 0%, transparent 70%)',
          top: -100, right: -100,
        }} />
        <Box sx={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(21, 101, 192, 0.2) 0%, transparent 70%)',
          bottom: -80, left: -60,
        }} />
        <Box sx={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 124, 0, 0.15) 0%, transparent 70%)',
          top: 60, left: '20%',
        }} />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box sx={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(66, 165, 245, 0.25), rgba(171, 71, 188, 0.25))',
              border: '2px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}>
              <SchoolIcon sx={{ fontSize: 36, color: '#fff' }} />
            </Box>
          </Box>
          <Typography variant="h2" sx={{
            fontWeight: 800, mb: 3,
            fontSize: { xs: '2rem', sm: '2.8rem', md: '3.5rem' },
            lineHeight: 1.15,
          }}>
            About{' '}
            <Box component="span" sx={{
              background: 'linear-gradient(135deg, #42a5f5, #ab47bc, #ffb74d)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              LearnHub
            </Box>
          </Typography>
          <Typography variant="h5" sx={{
            fontWeight: 400,
            color: 'rgba(255,255,255,0.8)',
            maxWidth: 650,
            mx: 'auto',
            lineHeight: 1.6,
            fontSize: { xs: '1.1rem', md: '1.35rem' },
          }}>
            Empowering learners, inspiring teachers, building community.
          </Typography>
        </Container>
      </Paper>

      {/* ── Our Mission ── */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" sx={{
            color: '#ab47bc', fontWeight: 700, letterSpacing: 2, fontSize: '0.85rem',
          }}>
            Our Mission
          </Typography>
          <Typography variant="h3" sx={{
            fontWeight: 700, mt: 1, mb: 2,
            fontSize: { xs: '1.8rem', md: '2.4rem' },
          }}>
            Why LearnHub Exists
          </Typography>
          <Typography variant="body1" sx={{
            color: 'rgba(255,255,255,0.6)', maxWidth: 600, mx: 'auto', fontSize: '1.05rem',
          }}>
            We believe that great education changes lives. LearnHub was built to make learning
            accessible, collaborative, and genuinely enjoyable for everyone.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {missionCards.map((card) => {
            const Icon = card.icon;
            return (
              <Grid item xs={12} md={4} key={card.title}>
                <Paper elevation={0} sx={{
                  p: 4, borderRadius: 3, height: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid rgba(255,255,255,0.08)`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: card.color,
                    boxShadow: `0 8px 32px ${card.color}22`,
                  },
                }}>
                  <Box sx={{
                    width: 56, height: 56, borderRadius: 2,
                    background: `linear-gradient(135deg, ${card.color}22, ${card.color}11)`,
                    border: `1px solid ${card.color}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mb: 3,
                  }}>
                    <Icon sx={{ fontSize: 28, color: card.color }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                    {card.description}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* ── How It Works ── */}
      <Box sx={{
        background: 'linear-gradient(180deg, rgba(26, 35, 126, 0.08) 0%, rgba(123, 31, 162, 0.06) 100%)',
        py: { xs: 8, md: 10 },
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="overline" sx={{
              color: '#42a5f5', fontWeight: 700, letterSpacing: 2, fontSize: '0.85rem',
            }}>
              How It Works
            </Typography>
            <Typography variant="h3" sx={{
              fontWeight: 700, mt: 1, mb: 2,
              fontSize: { xs: '1.8rem', md: '2.4rem' },
            }}>
              Getting Started Is Easy
            </Typography>
            <Typography variant="body1" sx={{
              color: 'rgba(255,255,255,0.6)', maxWidth: 500, mx: 'auto', fontSize: '1.05rem',
            }}>
              Three simple steps to unlock a world of learning.
            </Typography>
          </Box>

          <Grid container spacing={4} alignItems="stretch">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <Grid item xs={12} md={4} key={step.number}>
                  <Box sx={{ textAlign: 'center', height: '100%', position: 'relative' }}>
                    {/* Connector line (between steps) */}
                    {index < steps.length - 1 && (
                      <Box sx={{
                        display: { xs: 'none', md: 'block' },
                        position: 'absolute', top: 40, left: '60%', width: '80%',
                        height: 2,
                        background: 'linear-gradient(90deg, rgba(66, 165, 245, 0.3), rgba(171, 71, 188, 0.3))',
                        zIndex: 0,
                      }} />
                    )}

                    {/* Numbered circle */}
                    <Box sx={{
                      width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 3,
                      background: 'linear-gradient(135deg, #1565c0, #7b1fa2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative', zIndex: 1,
                      boxShadow: '0 4px 24px rgba(123, 31, 162, 0.3)',
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff' }}>
                        {step.number}
                      </Typography>
                    </Box>

                    <Box sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 1, mb: 1.5,
                    }}>
                      <StepIcon sx={{ fontSize: 24, color: '#42a5f5' }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {step.title}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{
                      color: 'rgba(255,255,255,0.6)', maxWidth: 300, mx: 'auto', lineHeight: 1.7,
                    }}>
                      {step.description}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* ── Our Values ── */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" sx={{
            color: '#f57c00', fontWeight: 700, letterSpacing: 2, fontSize: '0.85rem',
          }}>
            Our Values
          </Typography>
          <Typography variant="h3" sx={{
            fontWeight: 700, mt: 1, mb: 2,
            fontSize: { xs: '1.8rem', md: '2.4rem' },
          }}>
            What We Stand For
          </Typography>
          <Typography variant="body1" sx={{
            color: 'rgba(255,255,255,0.6)', maxWidth: 550, mx: 'auto', fontSize: '1.05rem',
          }}>
            These principles guide every decision we make and every feature we build.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={value.title}>
                <Paper elevation={0} sx={{
                  p: 3.5, borderRadius: 3, height: '100%', textAlign: 'center',
                  background: value.gradient,
                  border: `1px solid ${value.borderColor}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 6px 24px ${value.borderColor}`,
                  },
                }}>
                  <Icon sx={{
                    fontSize: 40, mb: 2,
                    color: value.borderColor.replace('0.3', '1'),
                  }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {value.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                    {value.description}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* ── Meet the Platform (Stats) ── */}
      <Box sx={{
        py: { xs: 8, md: 10 },
        backgroundImage: `
          linear-gradient(135deg, rgba(26, 35, 126, 0.9) 0%, rgba(21, 101, 192, 0.85) 50%, rgba(123, 31, 162, 0.9) 100%),
          url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=80')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <Box sx={{
          position: 'absolute', width: 250, height: 250, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 124, 0, 0.15) 0%, transparent 70%)',
          top: -60, right: -40,
        }} />
        <Box sx={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(66, 165, 245, 0.15) 0%, transparent 70%)',
          bottom: -50, left: -30,
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="overline" sx={{
              color: '#ffb74d', fontWeight: 700, letterSpacing: 2, fontSize: '0.85rem',
            }}>
              Meet the Platform
            </Typography>
            <Typography variant="h3" sx={{
              fontWeight: 700, mt: 1, color: '#fff',
              fontSize: { xs: '1.8rem', md: '2.4rem' },
            }}>
              LearnHub by the Numbers
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Grid item xs={6} sm={3} key={stat.label}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{
                      width: 64, height: 64, borderRadius: '50%', mx: 'auto', mb: 2,
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backdropFilter: 'blur(8px)',
                    }}>
                      <Icon sx={{ fontSize: 30, color: stat.color }} />
                    </Box>
                    <Typography variant="h3" sx={{
                      fontWeight: 800, color: '#fff', mb: 0.5,
                      fontSize: { xs: '2rem', md: '2.5rem' },
                    }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body1" sx={{
                      color: 'rgba(255,255,255,0.7)', fontWeight: 500,
                    }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* ── Call to Action ── */}
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 10 } }}>
        <Paper elevation={0} sx={{
          p: { xs: 5, md: 7 }, borderRadius: 4, textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(21, 101, 192, 0.12), rgba(123, 31, 162, 0.12), rgba(245, 124, 0, 0.08))',
          border: '1px solid rgba(171, 71, 188, 0.2)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative circle */}
          <Box sx={{
            position: 'absolute', width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(171, 71, 188, 0.1) 0%, transparent 70%)',
            top: -60, right: -40,
          }} />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" sx={{
              fontWeight: 700, mb: 2,
              fontSize: { xs: '1.6rem', md: '2.2rem' },
            }}>
              Ready to Start Your Learning Journey?
            </Typography>
            <Typography variant="body1" sx={{
              color: 'rgba(255,255,255,0.6)', mb: 4, maxWidth: 480, mx: 'auto',
              fontSize: '1.1rem', lineHeight: 1.7,
            }}>
              Join hundreds of learners and teachers who are already building something
              incredible on LearnHub. Your next chapter starts here.
            </Typography>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                py: 1.5, px: 5,
                fontWeight: 700,
                fontSize: '1.05rem',
                background: 'linear-gradient(135deg, #1565c0 0%, #7b1fa2 100%)',
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                  boxShadow: '0 6px 24px rgba(123, 31, 162, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Get Started
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default About;
