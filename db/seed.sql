JoINSERT INTO department (name) 
VALUES 
('IT'),
('HR'),
('Sales'),
('Finance');

INSERT INTO role (title, salary, department_id)
VALUES
('Software Engineer', 100000, 1),
('HR Manager', 80000, 2),
('Sales Manager', 90000, 3),
('Finance Manager', 95000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('John', 'Doe', 1, NULL),
('Jane', 'Doe', 2, 1),
('Jack', 'Brown', 3, 2),
('Jill', 'Brown', 4, 3);
