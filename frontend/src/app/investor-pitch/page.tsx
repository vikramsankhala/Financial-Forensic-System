 'use client';
 
 import {
   Box,
   Card,
   CardContent,
   Chip,
   Container,
   Divider,
   Grid,
   List,
   ListItem,
   ListItemIcon,
   ListItemText,
   Paper,
   Stack,
   Typography,
 } from '@mui/material';
 import {
   CheckCircle as CheckIcon,
   Insights as InsightsIcon,
   Security as SecurityIcon,
   Timeline as TimelineIcon,
   TrendingUp as TrendingUpIcon,
   Group as GroupIcon,
   Public as PublicIcon,
   Payments as PaymentsIcon,
   RocketLaunch as RocketLaunchIcon,
 } from '@mui/icons-material';
 import Layout from '@/components/Layout';
 
 const slides = [
   {
     title: '1. Vision & Problem',
     subtitle: 'Financial crime teams are drowning in alerts and siloed tools.',
     bullets: [
       'Fraud losses rising with instant payments and digital channels.',
       'Legacy platforms lack real-time context, explainability, and collaboration.',
       'Investigations take days; regulators demand faster, auditable decisions.',
     ],
   },
   {
     title: '2. Solution Overview',
     subtitle: 'A unified, real-time fraud detection + forensic investigation platform.',
     bullets: [
       'Sub-100ms scoring with hybrid ML + rules.',
       'Case management, evidence trails, and audit-ready reporting in one workflow.',
       'Entity network analysis to expose fraud rings and coordinated behavior.',
     ],
   },
   {
     title: '3. Product Highlights',
     subtitle: 'Purpose-built for banks, fintechs, and payment operators.',
     bullets: [
       'Live alert queue with explainable risk indicators.',
       'Investigation workbench with timelines, notes, and SAR readiness.',
       'Role-based access and full audit logs for compliance.',
     ],
   },
   {
     title: '4. Market Opportunity',
     subtitle: 'Large, growing demand for real-time fraud defenses.',
     bullets: [
       'TAM: $29.07B fraud detection & prevention market (2024).',
       'Forecast $65.68B by 2030 (15.5% CAGR).',
       'Initial beachhead: regional banks, credit unions, PSPs.',
     ],
     chips: ['TAM $29.07B', '15.5% CAGR', 'Regulatory tailwinds'],
   },
   {
     title: '5. Traction & Validation',
     subtitle: 'Demo-ready workflows and pilot discussions.',
     bullets: [
       'End-to-end demo with synthetic scenarios and real-time feeds.',
       'Modular architecture ready for pilot onboarding.',
       'Pipeline focused on compliance-heavy institutions.',
     ],
   },
   {
     title: '6. Business Model',
     subtitle: 'SaaS + usage-based pricing aligned to volume and seats.',
     bullets: [
       'Tiered plans: Starter, Growth, Enterprise.',
       'Usage pricing per transaction and per active analyst.',
       'Implementation + premium support packages.',
     ],
   },
   {
     title: '7. Go-To-Market',
     subtitle: 'Land-and-expand with pilots into multi-year contracts.',
     bullets: [
       'Pilot-driven sales with security/compliance proof points.',
       'Partnerships with core banking, payment processors, and SI firms.',
       'Customer success playbooks for expansion.',
     ],
   },
   {
     title: '8. Competitive Edge',
     subtitle: 'Modern, unified workflow vs. fragmented legacy stacks.',
     bullets: [
       'Real-time scoring + investigations in one product.',
       'Embedded graph intelligence for ring detection.',
       'Fast deployment with API-first integration.',
     ],
   },
   {
     title: '9. Funding Ask (USD 5M)',
     subtitle: 'Use of funds to scale product and revenue.',
     bullets: [
       '40%: Product & ML engineering (risk models, explainability).',
       '30%: GTM (enterprise sales, partnerships, marketing).',
       '20%: Infrastructure & security (SOC2, reliability).',
       '10%: Operations & hiring.',
     ],
     chips: ['$5M Raise', '18-24 month runway', 'Series Seed / Pre-A'],
   },
 ];
 
 const metrics = [
   { label: 'Target ARR (24 months)', value: '$4-6M' },
   { label: 'Average ACV', value: '$150K-$350K' },
   { label: 'Gross Margin Target', value: '75%+' },
   { label: 'Pilot Conversion Target', value: '35%+' },
 ];
 
 export default function InvestorPitchPage() {
   return (
     <Layout breadcrumbs={[{ label: 'Investor Pitch' }]}>
       <Container maxWidth="lg">
         <Box mb={4}>
           <Typography variant="h3" component="h1" gutterBottom>
             Investor Pitch Deck
           </Typography>
           <Typography variant="h6" color="text.secondary">
             Raising USD 5M to scale the Financial Forensic System
           </Typography>
         </Box>
 
         <Paper sx={{ p: 4, mb: 4 }}>
           <Typography variant="h5" gutterBottom>
             Executive Snapshot
           </Typography>
           <Divider sx={{ mb: 3 }} />
           <Grid container spacing={2}>
             {metrics.map((metric) => (
               <Grid item xs={12} sm={6} md={3} key={metric.label}>
                 <Card variant="outlined">
                   <CardContent>
                     <Typography variant="subtitle2" color="text.secondary">
                       {metric.label}
                     </Typography>
                     <Typography variant="h6">{metric.value}</Typography>
                   </CardContent>
                 </Card>
               </Grid>
             ))}
           </Grid>
         </Paper>
 
         <Grid container spacing={3}>
           {slides.map((slide) => (
             <Grid item xs={12} key={slide.title}>
               <Card variant="outlined">
                 <CardContent>
                   <Box display="flex" alignItems="center" justifyContent="space-between">
                     <Box>
                       <Typography variant="h5" gutterBottom>
                         {slide.title}
                       </Typography>
                       <Typography variant="body2" color="text.secondary">
                         {slide.subtitle}
                       </Typography>
                     </Box>
                     <Stack direction="row" spacing={1}>
                       {slide.title.startsWith('1') && <InsightsIcon color="primary" />}
                       {slide.title.startsWith('2') && <RocketLaunchIcon color="primary" />}
                       {slide.title.startsWith('3') && <SecurityIcon color="primary" />}
                       {slide.title.startsWith('4') && <PublicIcon color="primary" />}
                       {slide.title.startsWith('5') && <TimelineIcon color="primary" />}
                       {slide.title.startsWith('6') && <PaymentsIcon color="primary" />}
                       {slide.title.startsWith('7') && <TrendingUpIcon color="primary" />}
                       {slide.title.startsWith('8') && <GroupIcon color="primary" />}
                       {slide.title.startsWith('9') && <RocketLaunchIcon color="primary" />}
                     </Stack>
                   </Box>
                   <List>
                     {slide.bullets.map((bullet) => (
                       <ListItem key={bullet}>
                         <ListItemIcon>
                           <CheckIcon color="primary" />
                         </ListItemIcon>
                         <ListItemText primary={bullet} />
                       </ListItem>
                     ))}
                   </List>
                   {slide.chips ? (
                     <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                       {slide.chips.map((chip) => (
                         <Chip key={chip} label={chip} variant="outlined" />
                       ))}
                     </Stack>
                   ) : null}
                 </CardContent>
               </Card>
             </Grid>
           ))}
         </Grid>
 
         <Paper sx={{ p: 4, mt: 4 }}>
           <Typography variant="h5" gutterBottom>
             Contact
           </Typography>
           <Divider sx={{ mb: 2 }} />
           <Typography variant="body1" color="text.secondary">
             Investor outreach and data room access are available upon request.
           </Typography>
         </Paper>
       </Container>
     </Layout>
   );
 }
