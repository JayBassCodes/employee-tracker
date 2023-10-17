const mySQL = require('mysql2');
const inquirer = require('inquirer');
require('console.table');
require('dotenv').config();

// Create connection to mySQL database
const connection = mySQL.createConnection({
    host: '127.0.0.1',
    port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Connect to mySQL server and database
connection.connect(function(err) {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }
  console.log('Connected to mySQL server.');
  connection.query('CREATE DATABASE IF NOT EXISTS employee_db', function (err, result) {
    if (err) throw err;
    console.log('employee_db database created or already exists.');
    start();
  });
});

// Start function
function start() {
  inquirer
    .prompt({
      name: 'action',
      type: 'list',
      message: 'What would you like to do?',
      choices:
        [
          'View all employees',
          'View all employees by department',
          'View all employees by manager',
          'Add employee',
          'Remove employee',
          'Update employee role',
          'Update employee manager',
          'View all roles',
          'Add role',
          'Remove role',
          'View all departments',
          'Add department',
          'Remove department',
          'Exit'
        ]
    })
    .then(function(answer) {
      switch (answer.action) {
      case 'View all employees':
        viewEmployees();
        break;

      case 'View all employees by department':
        viewEmployeesByDepartment();
        break;

      case 'View all employees by manager':
        viewEmployeesByManager();
        break;

      case 'Add employee':
        addEmployee();
        break;

      case 'Remove employee':
        removeEmployee();
        break;

      case 'Update employee role':
        updateEmployeeRole();
        break;

      case 'Update employee manager':
        updateEmployeeManager();
        break;

      case 'View all roles':
        viewRoles();
        break;

      case 'Add role':
        addRole();
        break;

      case 'Remove role':
        removeRole();
        break;

      case 'View all departments':
        viewDepartments();
        break;

      case 'Add department':
        addDepartment();
        break;

      case 'Remove department':
        removeDepartment();
        break;

      case 'Exit':
        connection.end();
        break;
      }
    });
}

// View all employees
function viewEmployees() {
  const query = 'SELECT * FROM employee';
  connection.query(query, function(err, res) {
    if (err) throw err;
    console.log('\n');
    console.table(res);
    start();
  });
}

// View all employees by department
function viewEmployeesByDepartment() {
  const query = 'SELECT * FROM department';
  connection.query(query, function(err, res) {
    if (err) throw err;
    const departmentChoices = res.map(({ id, name }) => ({
      value: id, name: `${id} ${name}`
    }));
    console.table(res);
    promptDepartment(departmentChoices);
  });
}

// Prompt user to select department
function promptDepartment(departmentChoices) {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'departmentId',
        message: 'Which department would you like to view?',
        choices: departmentChoices
      }
    ])
    .then(function(answer) {
      const query = 'SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id WHERE department.id = ?';
      connection.query(query, answer.departmentId, function(err, res) {
        if (err) throw err;
        console.log('\n');
        console.table(res);
        start();
      });
    });
}

// View all employees by manager
function viewEmployeesByManager() {
  const query = 'SELECT * FROM employee WHERE manager_id IS NULL';
  connection.query(query, function(err, res) {
    if (err) throw err;
    const managerChoices = res.map(({ id, first_name, last_name }) => ({
      value: id, name: `${first_name} ${last_name}`
    }));
    console.table(res);
    promptManager(managerChoices);
  });
}

// Prompt user to select manager
function promptManager(managerChoices) {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'managerId',
        message: 'Which manager would you like to view?',
        choices: managerChoices
      }
    ])
    .then(function(answer) {
      const query = 'SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id WHERE manager.id = ?';
      connection.query(query, answer.managerId, function(err, res) {
        if (err) throw err;
        console.log('\n');
        console.table(res);
        start();
      });
    });
}

// Add employee
function addEmployee() {
  const query = 'SELECT * FROM role';
  connection.query(query, function(err, res) {
    if (err) throw err;
    const roleChoices = res.map(({ id, title }) => ({
      value: id, name: `${id} ${title}`
    }));
    console.table(res);
    promptAdd(roleChoices);
  });
}

// Prompt user to add employee
function promptAdd(roleChoices) {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'first_name',
        message: 'What is the employee\'s first name?'
      },
      {
        type: 'input',
        name: 'last_name',
        message: 'What is the employee\'s last name?'
      },
      {
        type: 'list',
        name: 'role_id',
        message: 'What is the employee\'s role?',
        choices: roleChoices
      }
    ])
    .then(function(answer) {
      const query = 'INSERT INTO employee SET ?';
      connection.query(query, answer, function(err, res) {
        if (err) throw err;
        console.log('\n');
        console.log('Employee added.');
        console.log('\n');
        start();
      });
    });
}

// Remove employee
function removeEmployee() {
  const query = 'SELECT * FROM employee';
  connection.query(query, function(err, res) {
    if (err) throw err;
    const employeeChoices = res.map(({ id, first_name, last_name }) => ({
      value: id, name: `${first_name} ${last_name}`
    }));
    console.table(res);
    promptRemove(employeeChoices);
  });
}

// Prompt user to remove employee
function promptRemove(employeeChoices) {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Which employee would you like to remove?',
        choices: employeeChoices
      }
    ])
    .then(function(answer) {
      const query = 'DELETE FROM employee WHERE ?';
      connection.query(query, { id: answer.employeeId }, function(err, res) {
        if (err) throw err;
        console.log('\n');
        console.log('Employee removed.');
        console.log('\n');
        start();
      });
    });
}

// Update employee role
function updateEmployeeRole() {
  const query = 'SELECT * FROM employee';
  connection.query(query, function(err, res) {
    if (err) throw err;
    const employeeChoices = res.map(({ id, first_name, last_name }) => ({
      value: id, name: `${first_name} ${last_name}`
    }));
    console.table(res);
    promptUpdateRole(employeeChoices);
  });
}

// Prompt user to update employee role
function promptUpdateRole(employeeChoices) {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Which employee\'s role would you like to update?',
        choices: employeeChoices
      }
    ])
    .then(function(answer) {
      const query = 'SELECT * FROM role';
      connection.query(query, function(err, res) {
        if (err) throw err;
        const roleChoices = res.map(({ id, title }) => ({
          value: id, name: `${id} ${title}`
        }));
        console.table(res);
        promptRoleUpdate(roleChoices, answer);
      });
    });
}

// Prompt user to select role
function promptRoleUpdate(roleChoices, answer) {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'roleId',
        message: 'Which role would you like to assign the selected employee?',
        choices: roleChoices
      }
    ])
    .then(function(roleAnswer) {
      const query = 'UPDATE employee SET role_id = ? WHERE id = ?';
      connection.query(query, [roleAnswer.roleId, answer.employeeId], function(err, res) {
        if (err) throw err;
        console.log('\n');
        console.log('Employee role updated.');
        console.log('\n');
        start();
      });
    });
}

// Update employee manager
function updateEmployeeManager() {
  const query = 'SELECT * FROM employee';
  connection.query(query, function(err, res) {
    if (err) throw err;
    const employeeChoices = res.map(({ id, first_name, last_name }) => ({
      value: id, name: `${first_name} ${last_name}`
    }));
    console.table(res);
    promptUpdateManager(employeeChoices);
  });
}

// Prompt user to update employee manager
function promptUpdateManager(employeeChoices) {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Which employee\'s manager would you like to update?',
        choices: employeeChoices
      }
    ])
    .then(function(answer) {
      const query = 'SELECT * FROM employee WHERE id != ?';
      connection.query(query, answer.employeeId, function(err, res) {
        if (err) throw err;
        const managerChoices = res.map(({ id, first_name, last_name }) => ({
          value: id, name: `${first_name} ${last_name}`
        }));
        console.table(res);
        promptManagerUpdate(managerChoices, answer);
      });
    });
}

// Prompt user to select manager
function promptManagerUpdate(managerChoices, answer) {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'managerId',
        message: 'Which manager would you like to assign the selected employee?',
        choices: managerChoices
      }
    ])
    .then(function(managerAnswer) {
      const query = 'UPDATE employee SET manager_id = ? WHERE id = ?';
      connection.query(query, [managerAnswer.managerId, answer.employeeId], function(err, res) {
        if (err) throw err;
        console.log('\n');
        console.log('Employee manager updated.');
        console.log('\n');
        start();
      });
    });
}

// View all roles
function viewRoles() {
  const query = 'SELECT * FROM role';
  connection.query(query, function(err, res) {
    if (err) throw err;
    console.log('\n');
    console.table(res);
    start();
  });
}

// Add role
function addRole() {
  const query = 'SELECT * FROM department';
  connection.query(query, function(err, res) {
    if (err) throw err;
    const departmentChoices = res.map(({ id, name }) => ({
      value: id, name: `${id} ${name}`
    }));
    console.table(res);
    promptRole(departmentChoices);
  });
}

// Prompt user to add role
function promptRole(departmentChoices) {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'title',
        message: 'What is the role\'s title?'
      },
      {
        type: 'input',
        name: 'salary',
        message: 'What is the role\'s salary?'
      },
      {
        type: 'list',
        name: 'departmentId',
        message: 'Which department does the role belong to?',
        choices: departmentChoices
      }
    ])
    .then(function(answer) {
      const query = 'INSERT INTO role SET ?';
      connection.query(query, answer, function(err, res) {
        if (err) throw err;
        console.log('\n');
        console.log('Role added.');
        console.log('\n');
        start();
      });
    });
}

// Remove role
function removeRole() {
  const query = 'SELECT * FROM role';
  connection.query(query, function(err, res) {
    if (err) throw err;
    const roleChoices = res.map(({ id, title }) => ({
      value: id, name: `${id} ${title}`
    }));
    console.table(res);
    promptRoleRemove(roleChoices);
  });
}

// Prompt user to remove role
function promptRoleRemove(roleChoices) {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'roleId',
        message: 'Which role would you like to remove?',
        choices: roleChoices
      }
    ])
    .then(function(answer) {
      const query = 'DELETE FROM role WHERE ?';
      connection.query(query, { id: answer.roleId }, function(err, res) {
        if (err) throw err;
        console.log('\n');
        console.log('Role removed.');
        console.log('\n');
        start();
      });
    });
}

// View all departments
function viewDepartments() {
  const query = 'SELECT * FROM department';
  connection.query(query, function(err, res) {
    if (err) throw err;
    console.log('\n');
    console.table(res);
    start();
  });
}

// Add department
function addDepartment() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'name',
        message: 'What is the department\'s name?'
      }
    ])
    .then(function(answer) {
      const query = 'INSERT INTO department SET ?';
      connection.query(query, answer, function(err, res) {
        if (err) throw err;
        console.log('\n');
        console.log('Department added.');
        console.log('\n');
        start();
      });
    });
}

// Remove department
function removeDepartment() {
  const query = 'SELECT * FROM department';
  connection.query(query, function(err, res) {
    if (err) throw err;
    const departmentChoices = res.map(({ id, name }) => ({
      value: id, name: `${id} ${name}`
    }));
    console.table(res);
    promptDepartmentRemove(departmentChoices);
  });
}

// Prompt user to remove department
function promptDepartmentRemove(departmentChoices) {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'departmentId',
        message: 'Which department would you like to remove?',
        choices: departmentChoices
      }
    ])
    .then(function(answer) {
      const query = 'DELETE FROM department WHERE ?';
      connection.query(query, { id: answer.departmentId }, function(err, res) {
        if (err) throw err;
        console.log('\n');
        console.log('Department removed.');
        console.log('\n');
        start();
      });
    });
}

// Exit
function exit() {
  connection.end();
};