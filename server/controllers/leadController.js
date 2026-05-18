const Lead = require('../models/Lead');

const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({}).populate('assignedTo', 'name email');
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createLead = async (req, res) => {
  const { name, email, phone, source, status, assignedTo } = req.body;

  try {
    const lead = new Lead({
      name,
      email,
      phone,
      source,
      status,
      assignedTo: assignedTo || req.user._id,
    });

    const createdLead = await lead.save();
    res.status(201).json(createdLead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateLead = async (req, res) => {
  const { name, email, phone, source, status, assignedTo } = req.body;

  try {
    const lead = await Lead.findById(req.params.id);

    if (lead) {
      lead.name = name || lead.name;
      lead.email = email || lead.email;
      lead.phone = phone || lead.phone;
      lead.source = source || lead.source;
      lead.status = status || lead.status;
      lead.assignedTo = assignedTo || lead.assignedTo;

      const updatedLead = await lead.save();
      res.json(updatedLead);
    } else {
      res.status(404).json({ message: 'Lead not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (lead) {
      await lead.deleteOne();
      res.json({ message: 'Lead removed' });
    } else {
      res.status(404).json({ message: 'Lead not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeads, createLead, updateLead, deleteLead };
