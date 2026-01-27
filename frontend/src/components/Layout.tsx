'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Box,
  Breadcrumbs,
  Link,
  Collapse,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Receipt as TransactionIcon,
  Folder as CaseIcon,
  AccountTree as EntityIcon,
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
  MenuBook as UseCasesIcon,
  Warning as AlertIcon,
  Search as InvestigationIcon,
  Share as NetworkIcon,
  ExpandMore as ExpandMoreIcon,
  Description as DocsIcon,
  Summarize as SummaryIcon,
  Book as GuideIcon,
  SmartToy as AssistantIcon,
  AccountTree as ProcessFlowIcon,
  Hub as IntegrationIcon,
  Psychology as MLTechniquesIcon,
  Storage as BackendArchitectureIcon,
} from '@mui/icons-material';
import { AIAssistant } from '@/components/AIAssistant';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export default function Layout({ children, breadcrumbs }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      setDarkMode(saved === 'true');
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    window.location.reload();
  };

  const [useCasesOpen, setUseCasesOpen] = useState(pathname.startsWith('/use-cases'));
  const [docsOpen, setDocsOpen] = useState(pathname.startsWith('/docs') || pathname.startsWith('/process-flow'));
  const [assistantOpen, setAssistantOpen] = useState(false);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Transactions', icon: <TransactionIcon />, path: '/transactions' },
    { text: 'Cases', icon: <CaseIcon />, path: '/cases' },
    { text: 'Entities', icon: <EntityIcon />, path: '/entities' },
  ];

  const useCaseItems = [
    { text: 'Real-Time Alert Triage', icon: <AlertIcon />, path: '/use-cases/real-time-alert-triage' },
    { text: 'Complex Case Investigation', icon: <InvestigationIcon />, path: '/use-cases/complex-case-investigation' },
    { text: 'Network & Entity Analysis', icon: <NetworkIcon />, path: '/use-cases/network-entity-analysis' },
  ];

  const docsItems = [
    { text: 'Executive Summary', icon: <SummaryIcon />, path: '/docs/executive-summary' },
    { text: 'User Guide', icon: <GuideIcon />, path: '/docs/user-guide' },
    { text: 'Process Flow', icon: <ProcessFlowIcon />, path: '/process-flow' },
    { text: 'ML/AI Techniques', icon: <MLTechniquesIcon />, path: '/docs/ml-techniques' },
    { text: 'Backend Architecture', icon: <BackendArchitectureIcon />, path: '/docs/backend-architecture' },
    { text: 'System Integration', icon: <IntegrationIcon />, path: '/docs/integration' },
  ];

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Fraud Forensics
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={pathname === item.path}
              onClick={() => router.push(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton onClick={() => setUseCasesOpen(!useCasesOpen)}>
            <ListItemIcon>
              <UseCasesIcon />
            </ListItemIcon>
            <ListItemText primary="Use Cases" />
            <ExpandMoreIcon
              sx={{
                transform: useCasesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          </ListItemButton>
        </ListItem>
        <Collapse in={useCasesOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {useCaseItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={pathname === item.path}
                  onClick={() => router.push(item.path)}
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
        <ListItem disablePadding>
          <ListItemButton onClick={() => setDocsOpen(!docsOpen)}>
            <ListItemIcon>
              <DocsIcon />
            </ListItemIcon>
            <ListItemText primary="Documentation" />
            <ExpandMoreIcon
              sx={{
                transform: docsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          </ListItemButton>
        </ListItem>
        <Collapse in={docsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {docsItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={pathname === item.path}
                  onClick={() => router.push(item.path)}
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Fraud Detection Forensic Systems
          </Typography>
          <IconButton color="inherit" onClick={toggleDarkMode}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs sx={{ mb: 2 }}>
            {breadcrumbs.map((crumb, index) =>
              crumb.href ? (
                <Link
                  key={index}
                  color="inherit"
                  href={crumb.href}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(crumb.href!);
                  }}
                >
                  {crumb.label}
                </Link>
              ) : (
                <Typography key={index} color="text.primary">
                  {crumb.label}
                </Typography>
              )
            )}
          </Breadcrumbs>
        )}
        {children}
        <Box
          sx={{
            mt: 6,
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Credits
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Project Conceived, Designed and Developed by Vikram Singh Sankhala, Solinexta@gmail.com.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            For any queries, please WhatsApp +91 9819543261.
          </Typography>
        </Box>
      </Box>

      {/* AI Assistant Floating Button */}
      <Fab
        color="primary"
        aria-label="AI Assistant"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
        onClick={() => setAssistantOpen(true)}
      >
        <AssistantIcon />
      </Fab>

      {/* AI Assistant Dialog */}
      <Dialog
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            maxHeight: '800px',
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <AssistantIcon color="primary" />
              <Typography variant="h6">AI Assistant</Typography>
              <Chip label="Beta" size="small" color="primary" />
            </Box>
            <IconButton onClick={() => setAssistantOpen(false)} size="small">
              ×
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <AIAssistant context={`Current page: ${pathname}`} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
