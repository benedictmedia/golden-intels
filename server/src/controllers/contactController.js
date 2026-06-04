const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { createNotificationsForRole } = require('./notificationController')

const submitContact = async (req, res) => {
  const { name, email, phone, subject, message } = req.body
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ message: 'Name, email and message are required.' })
  }
  try {
    const contact = await prisma.contactMessage.create({
      data: { name: name.trim(), email: email.trim(), phone: phone?.trim() || null, subject: subject?.trim() || null, message: message.trim() }
    })
    await createNotificationsForRole(
      'admin',
      'New Contact Message',
      `${contact.name} sent a contact message${contact.subject ? ` about ${contact.subject}` : ''}.`,
      'contact'
    )
    res.status(201).json(contact)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getContacts = async (req, res) => {
  try {
    const contacts = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(contacts)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const markContactRead = async (req, res) => {
  try {
    const contact = await prisma.contactMessage.update({
      where: { id: parseInt(req.params.id) },
      data: { read: true }
    })
    res.json(contact)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteContact = async (req, res) => {
  try {
    await prisma.contactMessage.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { submitContact, getContacts, markContactRead, deleteContact }
