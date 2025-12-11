const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType } = require('docx');
const fs = require('fs');
const path = require('path');

async function generateDocumentation() {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Title
        new Paragraph({
          children: [
            new TextRun({
              text: "DROP - Delivery Platform",
              bold: true,
              size: 56,
              color: "22C55E"
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Complete Portal Documentation",
              size: 32,
              color: "666666"
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 }
        }),

        // Login Credentials Section
        new Paragraph({
          text: "Login Credentials",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        }),

        createTable([
          ["Portal", "URL", "Credentials"],
          ["Admin", "http://localhost:3000/admin/login", "Email: admin@drop.com\nPassword: admin123"],
          ["Vendor", "http://localhost:3000/vendor/login", "Phone: Any 10-digit number\nOTP: 123456"],
          ["Rider", "http://localhost:3000/rider/login", "Phone: Any 10-digit number\nOTP: 123456"],
          ["User", "http://localhost:3000/auth", "Phone: Any 10-digit number\nOTP: 123456"],
        ]),

        // Admin Portal Section
        new Paragraph({
          text: "Admin Portal",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 600, after: 200 }
        }),
        new Paragraph({
          text: "Core Pages",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        createTable([
          ["Screen", "URL"],
          ["Dashboard", "http://localhost:3000/admin"],
          ["Login", "http://localhost:3000/admin/login"],
          ["Orders", "http://localhost:3000/admin/orders"],
          ["Users", "http://localhost:3000/admin/users"],
          ["Vendors", "http://localhost:3000/admin/vendors"],
          ["Riders", "http://localhost:3000/admin/riders"],
          ["Zones", "http://localhost:3000/admin/zones"],
          ["Analytics", "http://localhost:3000/admin/analytics"],
          ["Settings", "http://localhost:3000/admin/settings"],
        ]),

        new Paragraph({
          text: "Departments",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        createTable([
          ["Screen", "URL"],
          ["Restaurants", "http://localhost:3000/admin/departments/restaurants"],
          ["Grocery", "http://localhost:3000/admin/departments/grocery"],
          ["Wine & Spirits", "http://localhost:3000/admin/departments/wine"],
          ["Dine-In", "http://localhost:3000/admin/departments/dine-in"],
          ["Genie", "http://localhost:3000/admin/departments/genie"],
          ["Hyperlocal", "http://localhost:3000/admin/departments/hyperlocal"],
        ]),

        new Paragraph({
          text: "Hyperlocal Categories",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        createTable([
          ["Screen", "URL"],
          ["Pharmacy", "http://localhost:3000/admin/hyperlocal/pharmacy"],
          ["Meat & Fish", "http://localhost:3000/admin/hyperlocal/meat"],
          ["Dairy", "http://localhost:3000/admin/hyperlocal/dairy"],
          ["Flowers", "http://localhost:3000/admin/hyperlocal/flowers"],
          ["Pet Supplies", "http://localhost:3000/admin/hyperlocal/pets"],
        ]),

        new Paragraph({
          text: "Fleet Management",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        createTable([
          ["Screen", "URL"],
          ["Live Map", "http://localhost:3000/admin/fleet/live"],
          ["Zones", "http://localhost:3000/admin/fleet/zones"],
          ["Shifts", "http://localhost:3000/admin/fleet/shifts"],
          ["Bike Fleet", "http://localhost:3000/admin/fleet/bike"],
          ["EV Fleet", "http://localhost:3000/admin/fleet/ev"],
        ]),

        new Paragraph({
          text: "AI Features",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        createTable([
          ["Screen", "URL"],
          ["Demand Prediction", "http://localhost:3000/admin/ai/demand"],
          ["Smart Assignment", "http://localhost:3000/admin/ai/assignment"],
          ["Fraud Detection", "http://localhost:3000/admin/ai/fraud"],
          ["Personalization", "http://localhost:3000/admin/ai/personalization"],
        ]),

        new Paragraph({
          text: "Finance",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        createTable([
          ["Screen", "URL"],
          ["Overview", "http://localhost:3000/admin/finance"],
          ["Vendor Payouts", "http://localhost:3000/admin/finance/vendor-payouts"],
          ["Rider Payouts", "http://localhost:3000/admin/finance/rider-payouts"],
          ["Commissions", "http://localhost:3000/admin/finance/commissions"],
          ["Invoices", "http://localhost:3000/admin/finance/invoices"],
        ]),

        new Paragraph({
          text: "Marketing",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        createTable([
          ["Screen", "URL"],
          ["Overview", "http://localhost:3000/admin/marketing"],
          ["Coupons", "http://localhost:3000/admin/marketing/coupons"],
          ["Push Notifications", "http://localhost:3000/admin/marketing/notifications"],
          ["Referrals", "http://localhost:3000/admin/marketing/referrals"],
          ["Segments", "http://localhost:3000/admin/marketing/segments"],
        ]),

        new Paragraph({
          text: "Compliance",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        createTable([
          ["Screen", "URL"],
          ["Overview", "http://localhost:3000/admin/compliance"],
          ["Age Verification", "http://localhost:3000/admin/compliance/age"],
          ["Liquor Licensing", "http://localhost:3000/admin/compliance/liquor"],
          ["Audit Logs", "http://localhost:3000/admin/compliance/audit"],
        ]),

        // Vendor Portal Section
        new Paragraph({
          text: "Vendor Portal",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 600, after: 200 }
        }),
        new Paragraph({
          text: "Core Pages",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        createTable([
          ["Screen", "URL"],
          ["Login", "http://localhost:3000/vendor/login"],
          ["Onboarding", "http://localhost:3000/vendor/onboarding"],
          ["Dashboard", "http://localhost:3000/vendor/dashboard"],
          ["Orders", "http://localhost:3000/vendor/orders"],
          ["Menu", "http://localhost:3000/vendor/menu"],
          ["Analytics", "http://localhost:3000/vendor/analytics"],
          ["Earnings", "http://localhost:3000/vendor/earnings"],
          ["Reviews", "http://localhost:3000/vendor/reviews"],
          ["Settings", "http://localhost:3000/vendor/settings"],
        ]),

        new Paragraph({
          text: "RMS (Restaurant Management System)",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        createTable([
          ["Screen", "URL"],
          ["Dashboard", "http://localhost:3000/vendor/rms"],
          ["POS", "http://localhost:3000/vendor/rms/pos"],
          ["Kitchen Display", "http://localhost:3000/vendor/rms/kds"],
          ["Tables", "http://localhost:3000/vendor/rms/tables"],
          ["Reservations", "http://localhost:3000/vendor/rms/reservations"],
          ["Waitlist", "http://localhost:3000/vendor/rms/waitlist"],
          ["Orders", "http://localhost:3000/vendor/rms/orders"],
          ["Menu", "http://localhost:3000/vendor/rms/menu"],
          ["Inventory", "http://localhost:3000/vendor/rms/inventory"],
          ["Staff", "http://localhost:3000/vendor/rms/staff"],
          ["Shifts", "http://localhost:3000/vendor/rms/shifts"],
          ["Guests (CRM)", "http://localhost:3000/vendor/rms/guests"],
          ["Reports", "http://localhost:3000/vendor/rms/reports"],
          ["Settings", "http://localhost:3000/vendor/rms/settings"],
        ]),

        // Rider Portal Section
        new Paragraph({
          text: "Rider Portal",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 600, after: 200 }
        }),
        createTable([
          ["Screen", "URL"],
          ["Login", "http://localhost:3000/rider/login"],
          ["Onboarding", "http://localhost:3000/rider/onboarding"],
          ["Dashboard", "http://localhost:3000/rider"],
          ["Orders", "http://localhost:3000/rider/orders"],
          ["Earnings", "http://localhost:3000/rider/earnings"],
          ["Profile", "http://localhost:3000/rider/profile"],
        ]),

        // User App Section
        new Paragraph({
          text: "User/Customer App",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 600, after: 200 }
        }),
        new Paragraph({
          text: "Authentication",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        createTable([
          ["Screen", "URL"],
          ["Login", "http://localhost:3000/auth"],
          ["Verify OTP", "http://localhost:3000/auth/verify"],
        ]),

        new Paragraph({
          text: "Home & Discovery",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        createTable([
          ["Screen", "URL"],
          ["Home", "http://localhost:3000"],
          ["Search", "http://localhost:3000/search"],
          ["Category", "http://localhost:3000/category/[id]"],
          ["Wine Category", "http://localhost:3000/category/wine"],
          ["Store", "http://localhost:3000/store/[id]"],
        ]),

        new Paragraph({
          text: "Orders",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        createTable([
          ["Screen", "URL"],
          ["Cart", "http://localhost:3000/cart"],
          ["Checkout", "http://localhost:3000/checkout"],
          ["Orders List", "http://localhost:3000/orders"],
          ["Order Details", "http://localhost:3000/orders/[id]"],
          ["Order Tracking", "http://localhost:3000/orders/[id]/track"],
        ]),

        new Paragraph({
          text: "Special Features",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        createTable([
          ["Screen", "URL"],
          ["Party Mode", "http://localhost:3000/party"],
          ["Genie (Concierge)", "http://localhost:3000/genie"],
          ["Subscription", "http://localhost:3000/subscription"],
          ["Notifications", "http://localhost:3000/notifications"],
        ]),

        new Paragraph({
          text: "Profile",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        createTable([
          ["Screen", "URL"],
          ["Profile", "http://localhost:3000/profile"],
          ["Edit Profile", "http://localhost:3000/profile/edit"],
          ["Addresses", "http://localhost:3000/profile/addresses"],
          ["Wallet", "http://localhost:3000/profile/wallet"],
          ["Payments", "http://localhost:3000/profile/payments"],
          ["Favorites", "http://localhost:3000/profile/favorites"],
          ["Loyalty", "http://localhost:3000/profile/loyalty"],
          ["Referral", "http://localhost:3000/profile/referral"],
          ["Settings", "http://localhost:3000/profile/settings"],
        ]),

        new Paragraph({
          text: "Support & Legal",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        createTable([
          ["Screen", "URL"],
          ["Help Center", "http://localhost:3000/support"],
          ["Live Chat", "http://localhost:3000/support/chat"],
          ["Privacy Policy", "http://localhost:3000/privacy"],
          ["Terms of Service", "http://localhost:3000/terms"],
        ]),

        // API Routes Section
        new Paragraph({
          text: "API Routes",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 600, after: 200 }
        }),
        new Paragraph({
          text: "The platform includes 70+ API routes covering authentication, orders, vendors, riders, payments, RMS operations, and admin functions. All API routes are located in /src/app/api/",
          spacing: { after: 200 }
        }),

        // Tech Stack Section
        new Paragraph({
          text: "Tech Stack",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 600, after: 200 }
        }),
        createTable([
          ["Technology", "Version/Details"],
          ["Framework", "Next.js 16 (App Router)"],
          ["Database", "PostgreSQL with Prisma ORM"],
          ["Styling", "TailwindCSS"],
          ["State Management", "Zustand"],
          ["Authentication", "JWT with HTTP-only cookies"],
          ["Maps", "Leaflet / React-Leaflet"],
          ["Payments", "Razorpay Integration"],
          ["Icons", "Lucide React"],
        ]),

        // Quick Start Section
        new Paragraph({
          text: "Quick Start Guide",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 600, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "1. ", bold: true }),
            new TextRun("Clone the repository: "),
            new TextRun({ text: "git clone git@github.com:Tatu1984/drop.git", italics: true }),
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "2. ", bold: true }),
            new TextRun("Install dependencies: "),
            new TextRun({ text: "npm install", italics: true }),
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "3. ", bold: true }),
            new TextRun("Set up environment variables (copy .env.example to .env.local)"),
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "4. ", bold: true }),
            new TextRun("Run database migrations: "),
            new TextRun({ text: "npx prisma db push", italics: true }),
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "5. ", bold: true }),
            new TextRun("Seed the database: "),
            new TextRun({ text: "npx prisma db seed", italics: true }),
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "6. ", bold: true }),
            new TextRun("Start development server: "),
            new TextRun({ text: "npm run dev", italics: true }),
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "7. ", bold: true }),
            new TextRun("Open "),
            new TextRun({ text: "http://localhost:3000", italics: true }),
          ],
          spacing: { after: 400 }
        }),

        // Footer
        new Paragraph({
          children: [
            new TextRun({
              text: "Generated on " + new Date().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }),
              color: "999999",
              size: 20
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 600 }
        }),
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(__dirname, '..', 'DROP_Platform_Documentation.docx'), buffer);
  console.log('Documentation generated: DROP_Platform_Documentation.docx');
}

function createTable(data) {
  const rows = data.map((row, rowIndex) => {
    return new TableRow({
      children: row.map((cell, cellIndex) => {
        return new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: cell,
                  bold: rowIndex === 0,
                  size: rowIndex === 0 ? 22 : 20
                })
              ]
            })
          ],
          shading: rowIndex === 0 ? { fill: "22C55E", color: "FFFFFF" } : undefined,
          width: cellIndex === 0 ? { size: 30, type: WidthType.PERCENTAGE } : { size: 70, type: WidthType.PERCENTAGE }
        });
      })
    });
  });

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE }
  });
}

generateDocumentation().catch(console.error);
