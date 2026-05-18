const Customer = require('../models/Customer');

const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({}).populate('assignedTo', 'name email');
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCustomer = async (req, res) => {
  const { name, email, phone, company, status, assignedTo } = req.body;

  try {
    const customer = new Customer({
      name,
      email,
      phone,
      company,
      status,
      assignedTo: assignedTo || req.user._id,
    });

    const createdCustomer = await customer.save();
    res.status(201).json(createdCustomer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCustomer = async (req, res) => {
  const { name, email, phone, company, status, assignedTo } = req.body;

  try {
    const customer = await Customer.findById(req.params.id);

    if (customer) {
      customer.name = name || customer.name;
      customer.email = email || customer.email;
      customer.phone = phone || customer.phone;
      customer.company = company || customer.company;
      customer.status = status || customer.status;
      customer.assignedTo = assignedTo || customer.assignedTo;

      const updatedCustomer = await customer.save();
      res.json(updatedCustomer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (customer) {
      await customer.deleteOne();
      res.json({ message: 'Customer removed' });
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCustomers, createCustomer, updateCustomer, deleteCustomer };
