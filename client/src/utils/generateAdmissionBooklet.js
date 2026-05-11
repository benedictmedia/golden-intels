import { Document, Packer, Paragraph, TextRun, AlignmentType, ImageRun, BorderStyle, Table, TableRow, TableCell, WidthType, ShadingType } from 'docx'
import { saveAs } from 'file-saver'

const loadImageAsBuffer = async (url) => {
  const res = await fetch(url)
  const blob = await res.blob()
  return await blob.arrayBuffer()
}

const field = (label, value) => new TableRow({
  children: [
    new TableCell({
      width: { size: 35, type: WidthType.PERCENTAGE },
      shading: { type: ShadingType.SOLID, color: 'E8EEF7' },
      children: [new Paragraph({
        children: [new TextRun({ text: label, bold: true, size: 20, font: 'Times New Roman', color: '1a3c6e' })]
      })]
    }),
    new TableCell({
      width: { size: 65, type: WidthType.PERCENTAGE },
      children: [new Paragraph({
        children: [new TextRun({ text: value || '—', size: 20, font: 'Times New Roman' })]
      })]
    }),
  ]
})

const sectionTitle = (title) => new Paragraph({
  spacing: { before: 300, after: 150 },
  children: [new TextRun({ text: title, bold: true, size: 26, color: 'FFFFFF', font: 'Times New Roman' })],
  shading: { type: ShadingType.SOLID, fill: '1a3c6e' },
})

const makeTable = (rows) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows,
})

export const generateAdmissionBooklet = async (formData = {}, photoFile = null, nhisFrontFile = null, nhisBackFile = null, ghanaFrontFile = null, ghanaBackFile = null) => {

  let logoBuffer = null
  let photoBuffer = null
  let nhisFrontBuffer = null
  let nhisBackBuffer = null
  let ghanaFrontBuffer = null
  let ghanaBackBuffer = null

  try { logoBuffer = await loadImageAsBuffer('/src/assets/logo.png') } catch (e) {}

  const fileToBuffer = async (file) => {
    if (!file) return null
    return await file.arrayBuffer()
  }

  photoBuffer = await fileToBuffer(photoFile)
  nhisFrontBuffer = await fileToBuffer(nhisFrontFile)
  nhisBackBuffer = await fileToBuffer(nhisBackFile)
  ghanaFrontBuffer = await fileToBuffer(ghanaFrontFile)
  ghanaBackBuffer = await fileToBuffer(ghanaBackFile)

  const doc = new Document({
    sections: [{
      properties: {},
      children: [

        // Header
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [
            ...(logoBuffer ? [new ImageRun({ data: logoBuffer, transformation: { width: 90, height: 90 } })] : []),
          ]
        }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'GOLDEN-INTELS INTERNATIONAL SCHOOL', bold: true, size: 36, color: '1a3c6e', font: 'Times New Roman' })]
        }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'Oxford Accredited Institution | Excellence in Education', size: 22, color: 'd4a017', font: 'Times New Roman', italics: true })]
        }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 200 },
          children: [new TextRun({ text: 'OFFICIAL ADMISSION BOOKLET', bold: true, size: 30, color: '1a3c6e', font: 'Times New Roman' })]
        }),

        new Paragraph({ border: { bottom: { style: BorderStyle.DOUBLE, size: 4, color: 'd4a017' } }, text: '' }),
        new Paragraph({ text: '' }),

        // Rules Section
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 },
          children: [new TextRun({ text: 'SCHOOL RULES AND REGULATIONS', bold: true, size: 30, color: '1a3c6e', font: 'Times New Roman' })]
        }),

        ...[
          ['1. Academic Honesty Policy', 'All students are expected to uphold the highest standards of academic integrity. Plagiarism, cheating, and any form of academic dishonesty will result in disciplinary action, including but not limited to, a failing grade on the assignment, suspension, or expulsion. Students are encouraged to seek clarification from their teachers regarding proper citation and collaboration guidelines.'],
          ['2. Student Dress Code', 'Students are required to dress in a manner that is appropriate for a school environment, promoting a positive and respectful atmosphere. Clothing should be clean, modest, and free of offensive language or imagery. Specific guidelines regarding uniforms, footwear, and accessories are detailed in the student handbook. Violations may result in being sent home to change.'],
          ['3. Attendance and Punctuality', 'Regular attendance and punctuality are crucial for academic success. Students are expected to be in class on time every day. Absences must be reported by a parent/guardian and excused within 24 hours. Unexcused absences or excessive tardiness will lead to disciplinary consequences, including detention or loss of privileges.'],
          ['4. Technology Use Policy', 'School-provided and personal electronic devices are to be used responsibly and for educational purposes only during school hours, unless otherwise permitted by staff. Misuse, including cyberbullying, accessing inappropriate content, or disrupting class, is strictly prohibited and will result in confiscation of the device and disciplinary action.'],
          ['5. Health and Safety Guidelines', 'The school is committed to providing a safe and healthy environment for all. Students must adhere to all safety protocols, including emergency procedures, fire drills, and health regulations. Any health concerns or allergies should be reported to the school nurse immediately. Possession of weapons, drugs, or alcohol is strictly forbidden.'],
          ['6. Extracurricular Activities Participation', 'Participation in extracurricular activities is encouraged for holistic development. Students must maintain satisfactory academic standing and good behavioral records to be eligible. Specific eligibility criteria and conduct expectations for each activity are outlined by the respective club advisors or coaches. Failure to meet these standards may result in removal from the activity.'],
        ].flatMap(([title, content]) => [
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: title, bold: true, size: 24, color: '1a3c6e', font: 'Times New Roman' })]
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [new TextRun({ text: content, size: 20, font: 'Times New Roman' })]
          }),
        ]),

        new Paragraph({ border: { bottom: { style: BorderStyle.DOUBLE, size: 4, color: 'd4a017' } }, text: '' }),
        new Paragraph({ text: '' }),

        // Admission Form Preview Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 },
          children: [new TextRun({ text: 'ADMISSION FORM', bold: true, size: 30, color: '1a3c6e', font: 'Times New Roman' })]
        }),

        // Passport Photo
        ...(photoBuffer ? [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
            children: [
              new TextRun({ text: 'Passport Photo:', bold: true, size: 20, font: 'Times New Roman', color: '1a3c6e' }),
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
            children: [
              new ImageRun({ data: photoBuffer, transformation: { width: 100, height: 120 } })
            ]
          }),
        ] : []),

        // Learner's Data
        sectionTitle("LEARNER'S DATA"),
        makeTable([
          field('First Name', formData.firstName),
          field('Last Name', formData.lastName),
          field('Date of Birth', formData.dateOfBirth),
          field('Gender', formData.gender),
          field('Age', formData.age),
          field('Month of Birth', formData.monthOfBirth),
          field('Place of Birth', formData.placeOfBirth),
          field('Height (cm)', formData.height),
          field('Weight (kg)', formData.weight),
          field('Hometown', formData.hometown),
          field('Mother Tongue', formData.motherTongue),
          field('Religion', formData.religion),
          field('Date of Admission', formData.dateOfAdmission),
          field('Grade Level Applying For', formData.gradeLevel),
          field('Previous School', formData.previousSchool),
        ]),

        new Paragraph({ text: '' }),

        // Family Data
        sectionTitle('FAMILY DATA'),
        makeTable([
          field('Parent/Guardian Name', formData.parentName),
          field('Parent/Guardian Occupation', formData.parentOccupation),
          field('Email Address', formData.parentEmail),
          field('Phone Number', formData.parentPhone),
          field('Secondary Contact Name', formData.secondaryContactName),
          field('Secondary Contact Phone', formData.secondaryContactPhone),
        ]),

        new Paragraph({ text: '' }),

        // Father Info
        sectionTitle("FATHER'S INFORMATION"),
        makeTable([
          field('Name', formData.fatherName),
          field('Address', formData.fatherAddress),
          field('Nationality', formData.fatherNationality),
          field('Marital Status', formData.fatherMaritalStatus),
          field('Telephone Number', formData.fatherPhone),
          field('House Number', formData.fatherHouseNumber),
          field('Religion', formData.fatherReligion),
          field('Occupation', formData.fatherOccupation),
          field('Place of Work', formData.fatherPlaceOfWork),
          field('Level of Education', formData.fatherEducation),
          field('Email', formData.fatherEmail),
          field('Date', formData.fatherDate),
        ]),

        new Paragraph({ text: '' }),

        // Mother Info
        sectionTitle("MOTHER'S INFORMATION"),
        makeTable([
          field('Name', formData.motherName),
          field('Address', formData.motherAddress),
          field('Nationality', formData.motherNationality),
          field('Marital Status', formData.motherMaritalStatus),
          field('Telephone Number', formData.motherPhone),
          field('House Number', formData.motherHouseNumber),
          field('Religion', formData.motherReligion),
          field('Occupation', formData.motherOccupation),
          field('Place of Work', formData.motherPlaceOfWork),
          field('Level of Education', formData.motherEducation),
          field('Email', formData.motherEmail),
          field('Date', formData.motherDate),
        ]),

        new Paragraph({ text: '' }),

        // Significant Data
        sectionTitle('SIGNIFICANT DATA'),
        makeTable([
          field('Youngster Lives With', formData.livesWith),
          field('Older Children in Household', formData.olderChildren),
          field('Younger Children in Household', formData.youngerChildren),
          field('Language 1', formData.language1),
          field('Language 2', formData.language2),
          field('Language 3', formData.language3),
          field('Language 4', formData.language4),
          field('Medical Conditions', formData.medicalConditions),
          field('Allergies', formData.allergies),
          field('Special Needs or Requirements', formData.specialNeeds),
          field('Preferred Doctor', formData.doctorName),
          field('Doctor Phone', formData.doctorPhone),
          field('Hospital Name', formData.hospitalName),
          field('Hospital Phone', formData.hospitalPhone),
        ]),

        new Paragraph({ text: '' }),

        // Emergency Contact
        sectionTitle('EMERGENCY CONTACT'),
        makeTable([
          field('Contact Name', formData.emergencyName),
          field('Relationship', formData.emergencyRelationship),
          field('Phone Number', formData.emergencyPhone),
          field('Email Address', formData.emergencyEmail),
          field('Address/House Number', formData.emergencyAddress),
          field('WhatsApp Number', formData.emergencyWhatsapp),
          field('Date of Admission', formData.admissionDate),
        ]),

        new Paragraph({ text: '' }),

        // NHIS Card Images
        sectionTitle("CHILD'S NHIS CARD"),
        new Paragraph({ text: '' }),

        ...(nhisFrontBuffer ? [
          new Paragraph({
            children: [new TextRun({ text: 'NHIS Card - Front Side:', bold: true, size: 20, font: 'Times New Roman', color: '1a3c6e' })]
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [new ImageRun({ data: nhisFrontBuffer, transformation: { width: 200, height: 130 } })]
          }),
        ] : [
          new Paragraph({ children: [new TextRun({ text: 'NHIS Card - Front Side: Not uploaded', size: 20, font: 'Times New Roman', color: '888888', italics: true })] })
        ]),

        ...(nhisBackBuffer ? [
          new Paragraph({
            children: [new TextRun({ text: 'NHIS Card - Back Side:', bold: true, size: 20, font: 'Times New Roman', color: '1a3c6e' })]
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [new ImageRun({ data: nhisBackBuffer, transformation: { width: 200, height: 130 } })]
          }),
        ] : [
          new Paragraph({ children: [new TextRun({ text: 'NHIS Card - Back Side: Not uploaded', size: 20, font: 'Times New Roman', color: '888888', italics: true })] })
        ]),

        new Paragraph({ text: '' }),

        // Ghana Card Images
        sectionTitle("GUARDIAN'S GHANA CARD"),
        new Paragraph({ text: '' }),

        ...(ghanaFrontBuffer ? [
          new Paragraph({
            children: [new TextRun({ text: 'Ghana Card - Front Side:', bold: true, size: 20, font: 'Times New Roman', color: '1a3c6e' })]
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [new ImageRun({ data: ghanaFrontBuffer, transformation: { width: 200, height: 130 } })]
          }),
        ] : [
          new Paragraph({ children: [new TextRun({ text: 'Ghana Card - Front Side: Not uploaded', size: 20, font: 'Times New Roman', color: '888888', italics: true })] })
        ]),

        ...(ghanaBackBuffer ? [
          new Paragraph({
            children: [new TextRun({ text: 'Ghana Card - Back Side:', bold: true, size: 20, font: 'Times New Roman', color: '1a3c6e' })]
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [new ImageRun({ data: ghanaBackBuffer, transformation: { width: 200, height: 130 } })]
          }),
        ] : [
          new Paragraph({ children: [new TextRun({ text: 'Ghana Card - Back Side: Not uploaded', size: 20, font: 'Times New Roman', color: '888888', italics: true })] })
        ]),

        new Paragraph({ text: '' }),
        new Paragraph({ border: { bottom: { style: BorderStyle.DOUBLE, size: 4, color: 'd4a017' } }, text: '' }),
        new Paragraph({ text: '' }),

        // Consent Section
        sectionTitle('CONSENT AND AGREEMENT'),
        new Paragraph({ text: '' }),

        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: 'I acknowledge that I have read and understand these School Rules and Regulations, and I agree to uphold these standards and ensure my child complies with all school policies.', size: 22, font: 'Times New Roman' })]
        }),

        new Paragraph({ text: '' }),

        new Paragraph({
          children: [
            new TextRun({ text: 'Parent/Guardian Name: ', bold: true, size: 22, font: 'Times New Roman' }),
            new TextRun({ text: '_________________________________', size: 22, font: 'Times New Roman' }),
          ]
        }),

        new Paragraph({ text: '' }),

        new Paragraph({
          children: [
            new TextRun({ text: 'Parent/Guardian Signature: ', bold: true, size: 22, font: 'Times New Roman' }),
            new TextRun({ text: '__________________', size: 22, font: 'Times New Roman' }),
            new TextRun({ text: '          Date: ', bold: true, size: 22, font: 'Times New Roman' }),
            new TextRun({ text: '__________', size: 22, font: 'Times New Roman' }),
          ]
        }),

        new Paragraph({ text: '' }),

        new Paragraph({
          children: [
            new TextRun({ text: 'Student Name: ', bold: true, size: 22, font: 'Times New Roman' }),
            new TextRun({ text: '_________________________________', size: 22, font: 'Times New Roman' }),
          ]
        }),

        new Paragraph({ text: '' }),
        new Paragraph({ text: '' }),

        // Footer
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'Golden-Intels International School | Oxford Accredited | We Nurture for Nature', size: 18, color: '888888', font: 'Times New Roman', italics: true })]
        }),

      ]
    }]
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, 'Golden-Intels-Admission-Booklet.docx')
}