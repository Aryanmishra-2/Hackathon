# Install PDF Generation Library

Due to SSL certificate issues, you need to install pdfkit manually:

## Option 1: Fix SSL and Install
```bash
cd backend
npm config set strict-ssl false
npm install pdfkit
npm config set strict-ssl true
```

## Option 2: Use System CA
```bash
cd backend
set NODE_EXTRA_CA_CERTS=path\to\your\ca-bundle.crt
npm install pdfkit
```

## Option 3: Use Different Registry
```bash
cd backend
npm install pdfkit --registry=http://registry.npmjs.org/
```

## Verify Installation
```bash
npm list pdfkit
```

You should see:
```
backend@1.0.0
└── pdfkit@0.15.0
```

Once installed, the PDF generation will work automatically!
