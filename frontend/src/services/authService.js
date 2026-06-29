const users = [
  {
    email: "employee@test.com",
    password: "123456",
    role: "employee",
    name: "Aryan Mishra",
  },
  {
    email: "manager@test.com",
    password: "123456",
    role: "manager",
    name: "Rahul Sharma",
  },
  {
    email: "hr@test.com",
    password: "123456",
    role: "hr",
    name: "Sneha Gupta",
  },
];

export const loginUser = (email, password) => {
  return users.find(
    (user) => user.email === email && user.password === password
  );
};