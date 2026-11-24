INSERT INTO records (title, category, description, status)
SELECT * FROM (VALUES
  ('Help with JavaScript loops', 'Programming', 'I do not understand the difference between a for loop and a while loop.', 'Pending'),
  ('Understanding derivatives', 'Mathematics', 'I need help seeing how the power rule is used on simple functions.', 'In progress'),
  ('SQL joins explained', 'Databases', 'Please explain INNER JOIN and LEFT JOIN with a small example.', 'Completed'),
  ('Debugging Java exceptions', 'Programming', 'My program crashes with a NullPointerException and I cannot find why.', 'In progress'),
  ('Normalisation practice', 'Databases', 'I need practice questions on first, second and third normal form.', 'Pending'),
  ('Matrix multiplication steps', 'Mathematics', 'Show me the steps for multiplying a 2x3 matrix by a 3x2 matrix.', 'Completed'),
  ('Writing a clean HTML form', 'Programming', 'I want to learn how to label inputs and group form fields correctly.', 'Pending'),
  ('Primary and foreign keys', 'Databases', 'I get confused about how a foreign key links two tables together.', 'In progress')
) AS v(title, category, description, status)
WHERE NOT EXISTS (SELECT 1 FROM records);