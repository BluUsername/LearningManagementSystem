import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card, CardContent, CardActions, Typography, Button, Chip, Box,
} from '@mui/material';
import { Person as PersonIcon, Groups as GroupsIcon } from '@mui/icons-material';

function CourseCard({ course, showEnroll, onEnroll, enrolled, showActions, onEdit, onDelete }) {
  return (
    <Card elevation={0} sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderTop: '3px solid transparent',
      borderImage: 'linear-gradient(135deg, #42a5f5, #ab47bc, #f57c00) 1',
      overflow: 'visible',
    }}>
      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        <Typography variant="h6" component="h2" gutterBottom sx={{ color: '#e8eaf6' }}>
          {course.title}
        </Typography>
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
