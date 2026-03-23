import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card, CardContent, CardActions, Typography, Button, Chip, Box,
} from '@mui/material';
import { Person as PersonIcon, Groups as GroupsIcon } from '@mui/icons-material';

// Rotating course header images for visual variety
const courseImages = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1523050854058-8df90110c8f1?auto=format&fit=crop&w=600&q=80',
];

function CourseCard({ course, showEnroll, onEnroll, enrolled, showActions, onEdit, onDelete }) {
  const imageUrl = courseImages[(course.id || 0) % courseImages.length];

  return (
    <Card elevation={0} sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Course Image Header */}
      <Box sx={{
        height: { xs: 100, sm: 120, md: 140 },
        aspectRatio: '16/9',
        backgroundImage: `
          linear-gradient(135deg, rgba(21, 101, 192, 0.7) 0%, rgba(123, 31, 162, 0.6) 100%),
          url('${imageUrl}')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'flex-end',
        p: 2,
      }}>
        <Typography variant="h6" component="h2" sx={{
          color: '#fff',
          fontWeight: 700,
          textShadow: '0 1px 4px rgba(0,0,0,0.3)',
          lineHeight: 1.3,
        }}>
          {course.title}
        </Typography>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6, color: '#9fa8da' }}>
          {course.description.length > 150
            ? `${course.description.substring(0, 150)}...`
            : course.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<PersonIcon sx={{ color: '#42a5f5 !important' }} />}
            label={course.teacher_name}
            size="small"
            sx={{
              backgroundColor: 'rgba(66, 165, 245, 0.1)',
              color: '#90caf9',
              border: '1px solid rgba(66, 165, 245, 0.2)',
            }}
          />
          <Chip
            icon={<GroupsIcon sx={{ color: '#ab47bc !important' }} />}
            label={`${course.enrollment_count} enrolled`}
            size="small"
            sx={{
              backgroundColor: 'rgba(171, 71, 188, 0.1)',
              color: '#ce93d8',
              border: '1px solid rgba(171, 71, 188, 0.2)',
            }}
          />
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, gap: 0.5 }}>
        <Button size="small" component={RouterLink} to={`/courses/${course.id}`}
          sx={{ color: '#42a5f5' }}
        >
          View Details
        </Button>
        {showEnroll && (
          <Button
            size="small"
            variant="contained"
            onClick={onEnroll}
            sx={{
              background: 'linear-gradient(135deg, #f57c00, #ff9800)',
              color: '#fff',
              '&:hover': { background: 'linear-gradient(135deg, #e65100, #f57c00)' },
            }}
          >
            Enroll
          </Button>
        )}
        {enrolled && (
          <Chip label="Enrolled" size="small" variant="outlined"
            sx={{ color: '#66bb6a', borderColor: '#66bb6a' }}
          />
        )}
        {showActions && onEdit && (
          <Button size="small" variant="outlined" onClick={onEdit}
            sx={{ borderColor: 'rgba(66, 165, 245, 0.4)', color: '#42a5f5' }}
          >Edit</Button>
        )}
        {showActions && onDelete && (
          <Button size="small" variant="outlined" color="error" onClick={onDelete}>Delete</Button>
        )}
      </CardActions>
    </Card>
  );
}

CourseCard.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    teacher_name: PropTypes.string,
    enrollment_count: PropTypes.number,
  }).isRequired,
  showEnroll: PropTypes.bool,
  onEnroll: PropTypes.func,
  enrolled: PropTypes.bool,
  showActions: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

CourseCard.defaultProps = {
  showEnroll: false,
  onEnroll: undefined,
  enrolled: false,
  showActions: false,
  onEdit: undefined,
  onDelete: undefined,
};

export default CourseCard;
