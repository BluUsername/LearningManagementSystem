import { render, screen, fireEvent } from '@testing-library/react';
import HelpFAQ from '../pages/HelpFAQ';

// HelpFAQ is a static page — no API calls, no auth needed.
// This is the simplest type of test: just render and check content.

// CHECK: page title renders
test('renders Help & FAQ page title', () => {
  render(<HelpFAQ />);
  expect(screen.getByText(/Help & FAQ/)).toBeInTheDocument();
});

// CHECK: FAQ categories are present
test('renders FAQ categories', () => {
  render(<HelpFAQ />);
  expect(screen.getByText('Getting Started')).toBeInTheDocument();
  expect(screen.getByText('Courses')).toBeInTheDocument();
});

// CHECK: FAQ questions are visible
test('renders FAQ questions', () => {
  render(<HelpFAQ />);
  expect(screen.getByText('How do I create an account?')).toBeInTheDocument();
  expect(screen.getByText(/How do I enrol in a course/)).toBeInTheDocument();
});

// CHECK: FAQ question count chip is displayed
test('shows total question count', () => {
  render(<HelpFAQ />);
  expect(screen.getByText(/Questions Answered/)).toBeInTheDocument();
});

// DO: click on an accordion question
// CHECK: the answer expands and is visible
test('expands accordion to show answer when clicked', () => {
  render(<HelpFAQ />);
  const question = screen.getByText('How do I create an account?');
  fireEvent.click(question);
  expect(screen.getByText(/Click the "Register" button/)).toBeInTheDocument();
});
