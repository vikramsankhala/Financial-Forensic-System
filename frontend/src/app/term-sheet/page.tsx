 'use client';
 
 import {
   Box,
   Card,
   CardContent,
   Container,
   Divider,
   Grid,
   List,
   ListItem,
   ListItemIcon,
   ListItemText,
   Paper,
   Typography,
 } from '@mui/material';
 import { CheckCircle as CheckIcon } from '@mui/icons-material';
 import Layout from '@/components/Layout';
 
 const sections = [
   {
     title: 'Offering Summary',
     items: [
       'Round: Seed / Pre-Series A',
       'Amount: USD 5,000,000',
       'Security: Preferred equity',
       'Target close: 60-90 days',
     ],
   },
   {
     title: 'Valuation & Ownership',
     items: [
       'Pre-money valuation: $20,000,000 (target)',
       'Post-money valuation: $25,000,000 (target)',
       'Ownership offered: ~20% (fully diluted)',
     ],
   },
   {
     title: 'Use of Proceeds',
     items: [
       'Product & ML engineering: 40%',
       'Go-to-market & partnerships: 30%',
       'Infrastructure, security, compliance: 20%',
       'Operations & recruiting: 10%',
     ],
   },
   {
     title: 'Investor Rights',
     items: [
       'Standard major investor information rights',
       'Pro rata participation rights',
       'Board observation rights (1 seat)',
       'Protective provisions for major actions',
     ],
   },
   {
     title: 'Founder & Employee Matters',
     items: [
       'Founder vesting: 4-year vesting with 1-year cliff (if required)',
       'Employee option pool: 10% (pre-money)',
       'IP assignment and confidentiality reaffirmed',
     ],
   },
   {
     title: 'Governance & Reporting',
     items: [
       'Quarterly performance updates and KPI reporting',
       'Annual budget and operating plan review',
       'Audit-ready financial statements when applicable',
     ],
   },
   {
     title: 'Closing Conditions',
     items: [
       'Satisfactory legal, financial, and technical diligence',
       'Mutually agreed definitive documents',
       'No material adverse changes',
     ],
   },
   {
     title: 'Key Milestones (18-24 months)',
     items: [
       'Pilot to paid conversion for 5-8 financial institutions',
       'ACH/RTP fraud detection expansion + automated SAR workflows',
       'SOC 2 Type II readiness and enterprise security certifications',
     ],
   },
 ];
 
 export default function TermSheetPage() {
   return (
     <Layout breadcrumbs={[{ label: 'Term Sheet' }]}>
       <Container maxWidth="lg">
         <Box mb={4}>
           <Typography variant="h3" component="h1" gutterBottom>
             Term Sheet (Draft)
           </Typography>
           <Typography variant="h6" color="text.secondary">
             Financial Forensic System — USD 5M Raise
           </Typography>
         </Box>
 
         <Paper sx={{ p: 4, mb: 4 }}>
           <Typography variant="body2" color="text.secondary">
             This draft term sheet is for discussion purposes only and does not constitute a binding
             commitment. Final terms are subject to negotiation and definitive agreements.
           </Typography>
         </Paper>
 
         <Grid container spacing={3}>
           {sections.map((section) => (
             <Grid item xs={12} md={6} key={section.title}>
               <Card variant="outlined" sx={{ height: '100%' }}>
                 <CardContent>
                   <Typography variant="h5" gutterBottom>
                     {section.title}
                   </Typography>
                   <Divider sx={{ mb: 2 }} />
                   <List>
                     {section.items.map((item) => (
                       <ListItem key={item}>
                         <ListItemIcon>
                           <CheckIcon color="primary" />
                         </ListItemIcon>
                         <ListItemText primary={item} />
                       </ListItem>
                     ))}
                   </List>
                 </CardContent>
               </Card>
             </Grid>
           ))}
         </Grid>
 
         <Paper sx={{ p: 4, mt: 4 }}>
           <Typography variant="h6" gutterBottom>
             Next Steps
           </Typography>
           <Typography variant="body2" color="text.secondary">
             Upon investor interest, we will provide data room access, financial model assumptions,
             and reference materials to finalize the round.
           </Typography>
         </Paper>
       </Container>
     </Layout>
   );
 }
