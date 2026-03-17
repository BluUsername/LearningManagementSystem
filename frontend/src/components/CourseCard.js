import { Link as RouterLink } from 'react-router-dom';
import {
  Card, CardContent, CardActions, Typography, Button, Chip, Box,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

function CourseCard({ course, showEnroll, onEnroll, enrolled, showActions, onEdit, onDelete }) {
  return (
    <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {course.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {course.description.length > 150
            ? `${course.description.substring(0, 150)}...`
            : course.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip icon={<PersonIcon />} label={course.teacher_name} size="small" />
          <Chip label={`${course.enrollment_count} enrolled`} size="small" color="secondary" />
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button size="small" component={RouterLink} to={`/courses/${course.id}`}>
          View Details
        </Button>
        {showEnroll && (
          <Button size="small" variant="contained" onClick={onEnroll}>
            Enroll
          </Button>
        )}
        {enrolled && (
          <Chip label="Enrolled" color="success" size="small" />
        )}
        {showActions && onEdit && (
          <Button size="small" color="primary" onClick={onEdit}>Edit</Button>
        )}
        {showActions && onDelete && (
          <Button size="small" color="error" onClick={onDelete}>Delete</Button>
        )}
      </CardActions>
    </Card>
  );
}

export default CourseCard;
