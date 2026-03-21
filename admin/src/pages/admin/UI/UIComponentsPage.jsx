import { useState } from 'react';
import {
  Card,
  Button,
  Input,
  Table,
  Select,
  MultiSelect,
  DatePicker,
  DateRangePicker,
  TimePicker,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  Textarea,
  Modal,
  Drawer,
  Tabs,
  Badge,
  Alert,
  Tooltip,
  Pagination,
  Avatar,
  AvatarGroup,
  Dropdown,
  Breadcrumb,
  Progress,
  CircularProgress,
  FileUpload,
  Spinner,
  BarsLoader,
  PageHeader,
  useToast,
  Notification,
  Collapse,
} from '@components/ui';
import {
  Edit,
  Trash2,
  Eye,
  Download,
  Settings,
  User,
  Mail,
  Phone,
  MapPin,
  Users,
  BookOpen,
  Search,
  DollarSign,
  Lock,
  Globe,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  CheckCircle2,
  Ban,
  TrendingUp,
  Lightbulb,
  Palette,
  MapPinned,
  Clock,
  Truck,
  Loader,
  LayoutGrid,
  List,
  Bell,
  ShieldCheck,
  UserPlus,
  Package,
  MessageSquare,
} from 'lucide-react';

// Dummy Data
const initialTableData = [
  {
    id: 1,
    product: 'Elegance Wall Clock',
    brand: 'TechBrand',
    image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=100&h=100&fit=crop',
    category: 'Home Decor',
    status: 'Pending',
    customerName: 'John Smith',
    customerEmail: 'johnsmith@mail.com',
    qty: 8,
    date: '01 Dec 2024',
    price: '$1,200',
    payment: 'Credit Card',
    shipping: 'Express'
  },
  {
    id: 2,
    product: 'StrideX Pro',
    brand: 'WearCo',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop',
    category: 'Footwear',
    status: 'Completed',
    customerName: 'Alice Brown',
    customerEmail: 'aliceb@mail.com',
    qty: 15,
    date: '29 Nov 2024',
    price: '$750',
    payment: 'PayPal',
    shipping: 'Standard'
  },
  {
    id: 3,
    product: 'EduCarry 360',
    brand: 'DecorArts',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop',
    category: 'School Supplies',
    status: 'Shipped',
    customerName: 'Leo Phillip',
    customerEmail: 'leophillip@mail.com',
    qty: 10,
    date: '03 Dec 2024',
    price: '$500',
    payment: 'Debit Card',
    shipping: 'Express'
  },
  {
    id: 4,
    product: 'BloomCraft Pot',
    brand: 'FurniWorld',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=100&h=100&fit=crop',
    category: 'Garden & Decor',
    status: 'Pending',
    customerName: 'Michael Green',
    customerEmail: 'mgreen@mail.com',
    qty: 3,
    date: '30 Nov 2024',
    price: '$2,400',
    payment: 'Credit Card',
    shipping: 'Priority'
  },
  {
    id: 5,
    product: 'Leather Wallet',
    brand: 'StylePro',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=100&h=100&fit=crop',
    category: 'Accessories',
    status: 'In Progress',
    customerName: 'Sarah Wilson',
    customerEmail: 'sarahw@mail.com',
    qty: 20,
    date: '02 Dec 2024',
    price: '$600',
    payment: 'PayPal',
    shipping: 'Standard'
  },
];

const selectOptions = [
  { value: 'class1', label: 'Class 1' },
  { value: 'class2', label: 'Class 2' },
  { value: 'class3', label: 'Class 3' },
  { value: 'class4', label: 'Class 4' },
  { value: 'class5', label: 'Class 5' },
  { value: 'class6', label: 'Class 6' },
  { value: 'class7', label: 'Class 7' },
];

const subjectOptions = [
  { value: 'math', label: 'Mathematics' },
  { value: 'science', label: 'Science' },
  { value: 'english', label: 'English' },
  { value: 'history', label: 'History' },
  { value: 'geography', label: 'Geography' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'biology', label: 'Biology' },
  { value: 'economics', label: 'Economics' },
  { value: 'accounting', label: 'Accounting' },
];

const radioOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const breadcrumbItems = [
  { label: 'Admin', href: '/admin' },
  { label: 'Settings', href: '/admin/settings' },
  { label: 'UI Components' },
];

const initialNotifications = [
  {
    id: 1,
    variant: 'order',
    title: 'New Order Received',
    description: 'Order #12345 has been placed by John Doe for $250.00',
    timestamp: '2 minutes ago',
    read: false,
  },
  {
    id: 2,
    variant: 'user',
    title: 'New User Registered',
    description: 'Sarah Wilson just signed up for a new account',
    timestamp: '15 minutes ago',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    id: 3,
    variant: 'success',
    title: 'Payment Successful',
    description: 'Payment of $1,200.00 has been processed successfully',
    timestamp: '1 hour ago',
    read: true,
  },
  {
    id: 4,
    variant: 'warning',
    title: 'Low Stock Alert',
    description: 'Product "StrideX Pro" has only 3 items remaining in stock',
    timestamp: '2 hours ago',
    read: true,
  },
  {
    id: 5,
    variant: 'security',
    title: 'Login from New Device',
    description: 'A new login was detected from Chrome on MacOS',
    timestamp: '5 hours ago',
    read: true,
  },
  {
    id: 6,
    variant: 'message',
    title: 'New Message from Support',
    description: 'Your ticket #789 has been updated with a new response',
    timestamp: 'Yesterday',
    read: true,
  },
];

const UIComponentsPage = () => {
  // Toast hook
  const toast = useToast();

  // Notification state
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const resetNotifications = () => {
    setNotifications(initialNotifications);
  };

  // State for all components
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedTime24, setSelectedTime24] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isIndeterminate, setIsIndeterminate] = useState(true);
  const [selectedGender, setSelectedGender] = useState('male');
  const [switchValue, setSwitchValue] = useState(true);
  const [switchWithIcons, setSwitchWithIcons] = useState(false);
  const [darkModeSwitch, setDarkModeSwitch] = useState(false);
  const [soundSwitch, setSoundSwitch] = useState(true);
  const [wifiSwitch, setWifiSwitch] = useState(true);
  const [textareaValue, setTextareaValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', or 'kanban'
  const [tableData, setTableData] = useState(initialTableData);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [showAlert, setShowAlert] = useState(true);
  const [visibleBadges, setVisibleBadges] = useState({
    carol: true,
    wade: true,
  });
  const [quantity, setQuantity] = useState(1);
  const [password, setPassword] = useState('');
  const [amount, setAmount] = useState(100);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPlacement, setDrawerPlacement] = useState('right');
  const [selectedRows, setSelectedRows] = useState([1, 3, 5]);

  const tableColumns = [
    {
      key: 'product',
      header: 'Product',
      width: '200px',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.image}
            alt={row.product}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="font-medium text-gray-900">{row.product}</div>
            <div className="text-gray-500 text-xs">{row.brand}</div>
          </div>
        </div>
      ),
    },
    { key: 'category', header: 'Category', width: '130px', cellClassName: 'text-gray-600' },
    {
      key: 'status',
      header: 'Status',
      width: '130px',
      render: (value) => {
        const statusConfig = {
          'Pending': { variant: 'warning', icon: Clock },
          'Completed': { variant: 'success', icon: CheckCircle2 },
          'Shipped': { variant: 'info', icon: Truck },
          'In Progress': { variant: 'danger', icon: Loader },
        };
        const config = statusConfig[value] || { variant: 'default', icon: null };
        return (
          <Badge variant={config.variant} type="outline" size="sm" icon={config.icon}>
            {value}
          </Badge>
        );
      },
    },
    {
      key: 'customer',
      header: 'Customer',
      width: '180px',
      render: (_, row) => (
        <div>
          <div className="font-medium text-gray-900">{row.customerName}</div>
          <div className="text-gray-500 text-xs">{row.customerEmail}</div>
        </div>
      ),
    },
    { key: 'qty', header: 'Qty', width: '60px', cellClassName: 'text-gray-600' },
    { key: 'date', header: 'Date Ordered', width: '150px', cellClassName: 'text-gray-600' },
    { key: 'price', header: 'Price', width: '100px', cellClassName: 'font-semibold text-gray-900' },
    { key: 'payment', header: 'Payment', width: '120px', cellClassName: 'text-gray-600' },
    { key: 'shipping', header: 'Shipping', width: '100px', cellClassName: 'text-gray-600' },
    {
      key: 'actions',
      header: 'Action',
      width: '120px',
      fixed: 'right',
      render: () => (
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-full bg-primary-100 hover:bg-primary-200 flex items-center justify-center text-primary-600 transition-colors">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleSort = (column, direction) => {
    setSortColumn(column);
    setSortDirection(direction);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="UI Components"
        subtitle="A showcase of all available UI components"
        breadcrumb={{ items: breadcrumbItems }}
        sticky
      />

      {/* Alerts Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">Alerts</h2>
        <div className="space-y-3">
          <Alert variant="info" title="Information">
            This is an informational alert message.
          </Alert>
          <Alert variant="success" title="Success">
            Your changes have been saved successfully.
          </Alert>
          <Alert variant="warning" title="Warning">
            Please review your input before submitting.
          </Alert>
          {showAlert && (
            <Alert
              variant="danger"
              title="Error"
              dismissible
              onDismiss={() => setShowAlert(false)}
            >
              Something went wrong. Please try again.
            </Alert>
          )}
        </div>
      </section>

      {/* Toast Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">Toast / Snackbar</h2>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Basic Toasts */}
            <div>
              <h3 className="font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)] mb-3">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    toast({
                      variant: 'success',
                      title: 'Success',
                      message: 'Your changes have been saved successfully.',
                    })
                  }
                >
                  Success Toast
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() =>
                    toast({
                      variant: 'danger',
                      title: 'Error',
                      message: 'Something went wrong. Please try again.',
                    })
                  }
                >
                  Error Toast
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    toast({
                      variant: 'warning',
                      title: 'Warning',
                      message: 'Your session will expire in 5 minutes.',
                    })
                  }
                >
                  Warning Toast
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast({
                      variant: 'info',
                      title: 'Info',
                      message: 'A new version is available for download.',
                    })
                  }
                >
                  Info Toast
                </Button>
              </div>
            </div>

            {/* Shorthand Methods */}
            <div>
              <h3 className="font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)] mb-3">Shorthand Methods</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success('File Uploaded', 'document.pdf uploaded successfully.')}
                >
                  toast.success()
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.error('Delete Failed', 'Unable to delete the selected item.')}
                >
                  toast.error()
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.warning('Storage Full', 'You have used 95% of your storage.')}
                >
                  toast.warning()
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info('Scheduled', 'Report will be generated at 6:00 PM.')}
                >
                  toast.info()
                </Button>
              </div>
            </div>

            {/* Custom Duration */}
            <div>
              <h3 className="font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)] mb-3">Custom Duration</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast({ variant: 'info', title: 'Quick', message: 'This disappears in 2 seconds.', duration: 2000 })
                  }
                >
                  2s Duration
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast({ variant: 'success', title: 'Long Toast', message: 'This stays for 8 seconds.', duration: 8000 })
                  }
                >
                  8s Duration
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast({ variant: 'warning', title: 'Persistent', message: 'This stays until you close it.', duration: 0, closable: true })
                  }
                >
                  Persistent (No Auto-dismiss)
                </Button>
              </div>
            </div>

            {/* Message Only */}
            <div>
              <h3 className="font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)] mb-3">Message Only (No Title)</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toast({ variant: 'success', message: 'Item added to cart!' })}
                >
                  Simple Message
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toast({ variant: 'danger', message: 'Network connection lost.' })}
                >
                  Error Message
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Notification Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">Notifications</h2>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Notification List */}
            <Notification.Group
              title={`Notifications (${notifications.filter((n) => !n.read).length} unread)`}
              onClearAll={notifications.length > 0 ? clearAllNotifications : undefined}
            >
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <Notification
                    key={n.id}
                    variant={n.variant}
                    title={n.title}
                    description={n.description}
                    timestamp={n.timestamp}
                    avatar={n.avatar}
                    read={n.read}
                    dismissible
                    onDismiss={() => dismissNotification(n.id)}
                    onClick={() => markAsRead(n.id)}
                    actions={
                      !n.read
                        ? [
                            { label: 'Mark as Read', variant: 'primary', onClick: () => markAsRead(n.id) },
                            { label: 'Dismiss', onClick: () => dismissNotification(n.id) },
                          ]
                        : undefined
                    }
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <Bell className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
                  <Button variant="link" size="sm" onClick={resetNotifications} className="mt-2">
                    Reset Notifications
                  </Button>
                </div>
              )}
            </Notification.Group>

            {notifications.length === 0 && null}
            {notifications.length > 0 && (
              <div className="flex justify-center">
                <Button variant="link" size="sm" onClick={resetNotifications}>
                  Reset Notifications
                </Button>
              </div>
            )}

            {/* Variant Showcase */}
            <div>
              <h3 className="font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)] mb-3">All Variants</h3>
              <div className="space-y-2">
                <Notification variant="success" title="Success" description="Operation completed" timestamp="Just now" read />
                <Notification variant="danger" title="Error" description="Something went wrong" timestamp="1 min ago" read />
                <Notification variant="warning" title="Warning" description="Disk space running low" timestamp="5 min ago" read />
                <Notification variant="info" title="Info" description="System update available" timestamp="10 min ago" read />
                <Notification variant="security" title="Security" description="Password changed successfully" timestamp="1 hour ago" read />
                <Notification variant="user" title="User" description="New team member joined" timestamp="2 hours ago" read />
                <Notification variant="order" title="Order" description="Order shipped via express" timestamp="3 hours ago" read />
                <Notification variant="message" title="Message" description="You have a new message" timestamp="Yesterday" read />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Buttons Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">Buttons</h2>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Variants */}
            <div>
              <h3 className="font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)] mb-3">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="dashed">Dashed</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="danger-outline">Danger Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)] mb-3">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            {/* With Icons */}
            <div>
              <h3 className="font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)] mb-3">With Icons</h3>
              <div className="flex flex-wrap gap-3">
                <Button prefixIcon={Download}>Download</Button>
                <Button suffixIcon={Eye} variant="outline">View</Button>
                <Button prefixIcon={Edit} suffixIcon={Settings} variant="secondary">Edit Settings</Button>
                <Button prefixIcon={Trash2} variant="danger">Delete</Button>
              </div>
            </div>

            {/* Icon Only */}
            <div>
              <h3 className="font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)] mb-3">Icon Only</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button prefixIcon={Edit} iconOnly size="sm" variant="outline" />
                <Button prefixIcon={Trash2} iconOnly variant="danger" />
                <Button prefixIcon={Eye} iconOnly size="lg" variant="secondary" />
                <Button prefixIcon={Download} iconOnly variant="ghost" />
              </div>
            </div>

            {/* States */}
            <div>
              <h3 className="font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)] mb-3">States</h3>
              <div className="flex flex-wrap gap-3">
                <Button loading>Loading</Button>
                <Button loading variant="outline">Loading</Button>
                <Button disabled>Disabled</Button>
                <Button disabled variant="outline">Disabled</Button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Badges Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">Badges</h2>
        <Card className="p-6">
          <div className="space-y-6">
            {/* With Avatar */}
            <div>
              <p className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.55)] mb-3">With Avatar</p>
              <div className="flex flex-wrap gap-3">
                <Badge type="outline" avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop">
                  Cameron Williamson
                </Badge>
                <Badge type="outline" avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop">
                  Kristin Watson
                </Badge>
              </div>
            </div>

            {/* Status with Dot & Icon */}
            <div>
              <p className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.55)] mb-3">Status Badges</p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="teal" type="outline"  size="sm" icon={CheckCircle2}>
                  Connected
                </Badge>
                <Badge variant="success" type="outline" dot>
                  Online
                </Badge>
                <Badge variant="danger" type="outline" dot>
                  Offline
                </Badge>
                <Badge variant="default" type="outline" icon={Ban}>
                  Disabled
                </Badge>
              </div>
            </div>

            {/* With Icon */}
            <div>
              <p className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.55)] mb-3">With Icon</p>
              <div className="flex flex-wrap gap-3">
                <Badge type="outline" icon={TrendingUp}>DALL-E</Badge>
                <Badge type="outline" icon={TrendingUp}>AI Canvas</Badge>
                <Badge type="outline" icon={TrendingUp}>Sora</Badge>
                <Badge type="outline" icon={TrendingUp}>AI Video Generation</Badge>
              </div>
            </div>

            {/* Dismissible */}
            <div>
              <p className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.55)] mb-3">Dismissible</p>
              <div className="flex flex-wrap items-center gap-3">
                {visibleBadges.carol && (
                  <Badge variant="teal" type="soft" icon={Lightbulb} dismissible onDismiss={() => setVisibleBadges(prev => ({ ...prev, carol: false }))}>
                    Carol's Inspiration
                  </Badge>
                )}
                {visibleBadges.wade && (
                  <Badge variant="default" type="soft" icon={Palette} dismissible onDismiss={() => setVisibleBadges(prev => ({ ...prev, wade: false }))}>
                    Wade's Moodboard
                  </Badge>
                )}
                {(!visibleBadges.carol || !visibleBadges.wade) && (
                  <button
                    onClick={() => setVisibleBadges({ carol: true, wade: true })}
                    className="text-sm text-primary-600 hover:underline"
                  >
                    Reset badges
                  </button>
                )}
              </div>
            </div>

            {/* Filled Badges */}
            <div>
              <p className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.55)] mb-3">Filled Badges</p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="purple" type="filled" icon={MapPinned}>
                  Massachusetts
                </Badge>
                <Badge variant="pink" type="filled" icon={MapPinned}>
                  Mississippi
                </Badge>
                <Badge variant="primary" type="filled" icon={User}>
                  Admin
                </Badge>
                <Badge variant="success" type="filled" icon={CheckCircle2}>
                  Verified
                </Badge>
              </div>
            </div>

            {/* Soft Badges */}
            <div>
              <p className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.55)] mb-3">Soft Badges</p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="teal">Teal</Badge>
                <Badge variant="purple">Purple</Badge>
                <Badge variant="pink">Pink</Badge>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <p className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.55)] mb-3">Sizes</p>
              <div className="flex flex-wrap items-center gap-3">
                <Badge size="sm" variant="primary">Small</Badge>
                <Badge size="md" variant="primary">Medium</Badge>
                <Badge size="lg" variant="primary">Large</Badge>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Form Inputs Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">Form Inputs</h2>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Basic Inputs */}
            <div>
              <h3 className="font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)] mb-3">Basic Inputs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name" placeholder="Enter your name" />
                <Input label="Email" type="email" placeholder="Enter email" prefixIcon={Mail} />
                <Input label="With Error" error="This field is required" placeholder="Error state" />
                <Input label="Disabled" disabled placeholder="Disabled input" />
              </div>
            </div>

            {/* Input Sizes */}
            <div>
              <h3 className="font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)] mb-3">Input Sizes</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Small" size="sm" placeholder="Small input" />
                <Input label="Medium" size="md" placeholder="Medium input" />
                <Input label="Large" size="lg" placeholder="Large input" />
              </div>
            </div>

            {/* Prefix & Suffix */}
            <div>
              <h3 className="font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)] mb-3">Prefix & Suffix</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="With Prefix Icon" prefixIcon={Search} placeholder="Search..." />
                <Input label="With Suffix Icon" suffixIcon={Globe} placeholder="Website" />
                <Input label="With Prefix Text" prefix="$" placeholder="0.00" />
                <Input label="With Suffix Text" suffix=".com" placeholder="yoursite" />
                <Input label="With Both" prefix="https://" suffix=".com" placeholder="example" />
                <Input label="With Both Icons" prefixIcon={Mail} suffixIcon={User} placeholder="email@user" />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <h3 className="font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)] mb-3">Password Input</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                  prefixIcon={Lock}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  label="Password (Small)"
                  type="password"
                  size="sm"
                  placeholder="Enter password"
                  prefixIcon={Lock}
                />
              </div>
            </div>

            {/* Number Input */}
            <div>
              <h3 className="font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)] mb-3">Number Input</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min={0}
                  max={100}
                />
                <Input
                  label="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step={10}
                  min={0}
                />
                <Input
                  label="Number (Disabled)"
                  type="number"
                  value={5}
                  disabled
                />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Textarea Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">Textarea</h2>
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Textarea
              label="Description"
              placeholder="Enter description..."
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
              rows={4}
            />
            <Textarea
              label="With Error"
              placeholder="Enter text..."
              error="Please provide more details"
              rows={4}
            />
          </div>
        </Card>
      </section>

      {/* Select Components Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">Select Components</h2>
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Select Class"
              options={selectOptions}
              value={selectedClass}
              onChange={setSelectedClass}
              placeholder="Choose a class"
              clearable
              searchable
            />
            <MultiSelect
              label="Select Subjects"
              options={subjectOptions}
              value={selectedSubjects}
              onChange={setSelectedSubjects}
              placeholder="Choose subjects"
              searchable
            />
          </div>
        </Card>
      </section>

      {/* Date Pickers Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">Date Pickers</h2>
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DateRangePicker
              label="Date Range"
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={setDateRange}
              placeholder="Select date range"
            />
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder="Pick a date"
            />
          </div>
        </Card>
      </section>

      {/* Time Picker Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">Time Picker</h2>
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TimePicker
              label="Select Time (12h)"
              value={selectedTime}
              onChange={setSelectedTime}
              placeholder="Pick a time"
              format="12h"
            />
            <TimePicker
              label="Select Time (24h)"
              value={selectedTime24}
              onChange={setSelectedTime24}
              placeholder="Pick a time"
              format="24h"
            />
          </div>
        </Card>
      </section>

      {/* Checkboxes, Radio & Switch Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">Checkboxes, Radio & Switch</h2>
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)]">Checkboxes</h3>
              <Checkbox
                label="Remember me"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
              />
              <Checkbox
                label="Indeterminate"
                indeterminate={isIndeterminate}
                onChange={() => setIsIndeterminate(false)}
              />
              <Checkbox label="Disabled" disabled />
              <Checkbox label="Checked & Disabled" checked disabled />
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)]">Radio Buttons</h3>
              <RadioGroup
                label="Gender"
                options={radioOptions}
                value={selectedGender}
                onChange={setSelectedGender}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)]">Switch / Toggle</h3>

              {/* Basic */}
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.55)]">Basic:</p>
                <Switch
                  label="Notifications"
                  checked={switchValue}
                  onChange={setSwitchValue}
                />
              </div>

              {/* Sizes */}
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.55)]">Sizes:</p>
                <div className="flex flex-wrap items-center gap-4">
                  <Switch label="Small" size="sm" checked={switchValue} onChange={setSwitchValue} />
                  <Switch label="Medium" size="md" checked={switchValue} onChange={setSwitchValue} />
                  <Switch label="Large" size="lg" checked={switchValue} onChange={setSwitchValue} />
                </div>
              </div>

              {/* With Default Icons */}
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.55)]">With Icons (Check/X):</p>
                <div className="flex flex-wrap items-center gap-4">
                  <Switch size="sm" showIcons label="Small" checked={switchWithIcons} onChange={setSwitchWithIcons} />
                  <Switch size="md" showIcons label="Medium" checked={switchWithIcons} onChange={setSwitchWithIcons} />
                  <Switch size="lg" showIcons label="Large" checked={switchWithIcons} onChange={setSwitchWithIcons} />
                </div>
              </div>

              {/* With Custom Icons */}
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.55)]">Custom Icons:</p>
                <div className="space-y-2">
                  <Switch
                    size="lg"
                    showIcons
                    checkedIcon={Sun}
                    uncheckedIcon={Moon}
                    label="Dark Mode"
                    checked={darkModeSwitch}
                    onChange={setDarkModeSwitch}
                  />
                  <Switch
                    size="lg"
                    showIcons
                    checkedIcon={Volume2}
                    uncheckedIcon={VolumeX}
                    label="Sound"
                    checked={soundSwitch}
                    onChange={setSoundSwitch}
                  />
                  <Switch
                    size="lg"
                    showIcons
                    checkedIcon={Wifi}
                    uncheckedIcon={WifiOff}
                    label="WiFi"
                    checked={wifiSwitch}
                    onChange={setWifiSwitch}
                  />
                </div>
              </div>

              {/* Disabled */}
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.55)]">Disabled:</p>
                <div className="flex flex-wrap items-center gap-4">
                  <Switch label="Off" disabled />
                  <Switch label="On" checked disabled />
                  <Switch showIcons label="With Icons" disabled />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Avatars Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">Avatars</h2>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Sizes */}
            <div>
              <p className="text-sm text-gray-600 dark:text-[rgba(255,255,255,0.65)] mb-3">Sizes:</p>
              <div className="flex flex-wrap items-end gap-4">
                <Avatar size="xs" name="John Doe" showTooltip />
                <Avatar size="sm" name="Jane Smith" showTooltip />
                <Avatar size="md" name="Bob Wilson" showTooltip />
                <Avatar size="lg" name="Alice Brown" showTooltip />
                <Avatar size="xl" name="Charlie Davis" showTooltip />
                <Avatar size="2xl" name="Eva Martinez" showTooltip />
              </div>
            </div>

            {/* With Images */}
            <div>
              <p className="text-sm text-gray-600 dark:text-[rgba(255,255,255,0.65)] mb-3">With Images:</p>
              <div className="flex flex-wrap items-center gap-4">
                <Avatar
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                  name="John Doe"
                  showTooltip
                />
                <Avatar
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                  name="Jane Smith"
                  showTooltip
                />
                <Avatar
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
                  name="Bob Wilson"
                  showTooltip
                />
                <Avatar
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
                  name="Alice Brown"
                  showTooltip
                />
              </div>
            </div>

            {/* Letter Avatars with Different Colors */}
            <div>
              <p className="text-sm text-gray-600 dark:text-[rgba(255,255,255,0.65)] mb-3">Letter Avatars (Auto-colored):</p>
              <div className="flex flex-wrap items-center gap-4">
                <Avatar name="John Doe" showTooltip />
                <Avatar name="Alice Brown" showTooltip />
                <Avatar name="Mike Wilson" showTooltip />
                <Avatar name="Sarah Connor" showTooltip />
                <Avatar name="David Lee" showTooltip />
                <Avatar name="Emma Watson" showTooltip />
                <Avatar name="Chris Evans" showTooltip />
                <Avatar name="Natasha Romanoff" showTooltip />
              </div>
            </div>

            {/* With Status */}
            <div>
              <p className="text-sm text-gray-600 dark:text-[rgba(255,255,255,0.65)] mb-3">With Status:</p>
              <div className="flex flex-wrap items-center gap-4">
                <Avatar name="John Doe" status="online" showTooltip tooltipContent="John Doe - Online" />
                <Avatar name="Jane Smith" status="offline" showTooltip tooltipContent="Jane Smith - Offline" />
                <Avatar name="Bob Wilson" status="busy" showTooltip tooltipContent="Bob Wilson - Busy" />
                <Avatar name="Alice Brown" status="away" showTooltip tooltipContent="Alice Brown - Away" />
              </div>
            </div>

            {/* With Icons */}
            <div>
              <p className="text-sm text-gray-600 dark:text-[rgba(255,255,255,0.65)] mb-3">With Icons:</p>
              <div className="flex flex-wrap items-center gap-4">
                <Avatar icon={User} showTooltip tooltipContent="User" />
                <Avatar icon={Settings} color="bg-success-500" showTooltip tooltipContent="Settings" />
                <Avatar icon={Mail} color="bg-danger-500" showTooltip tooltipContent="Mail" />
                <Avatar icon={Phone} color="bg-warning-500" showTooltip tooltipContent="Phone" />
                <Avatar icon={MapPin} color="bg-info-500" showTooltip tooltipContent="Location" />
                <Avatar icon={Users} color="bg-primary-600" showTooltip tooltipContent="Team" />
              </div>
            </div>

            {/* Custom Colors */}
            <div>
              <p className="text-sm text-gray-600 dark:text-[rgba(255,255,255,0.65)] mb-3">Custom Colors:</p>
              <div className="flex flex-wrap items-center gap-4">
                <Avatar name="Primary" color="bg-primary-500" showTooltip />
                <Avatar name="Success" color="bg-success-500" showTooltip />
                <Avatar name="Danger" color="bg-danger-500" showTooltip />
                <Avatar name="Warning" color="bg-warning-500" showTooltip />
                <Avatar name="Info" color="bg-info-500" showTooltip />
              </div>
            </div>

            {/* Avatar Groups with Array */}
            <div>
              <p className="text-sm text-gray-600 dark:text-[rgba(255,255,255,0.65)] mb-3">Avatar Groups (Stacked):</p>
              <div className="space-y-4">
                <div className="flex items-center gap-8">
                  <AvatarGroup
                    size="sm"
                    max={3}
                    avatars={[
                      { id: 1, src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', name: 'John Doe' },
                      { id: 2, src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', name: 'Jane Smith' },
                      { id: 3, src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', name: 'Bob Wilson' },
                      { id: 4, src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', name: 'Alice Brown' },
                      { id: 5, name: 'Charlie Davis' },
                    ]}
                  />
                  <AvatarGroup
                    size="sm"
                    max={3}
                    avatars={[
                      { id: 1, src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', name: 'Michael Chen' },
                      { id: 2, src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', name: 'Emily Rose' },
                      { id: 3, name: 'David Kim' },
                      { id: 4, name: 'Lisa Wang' },
                      { id: 5, name: 'James Taylor' },
                      { id: 6, name: 'Sophie Miller' },
                    ]}
                  />
                </div>

                <div className="flex items-center gap-8">
                  <AvatarGroup
                    size="md"
                    max={4}
                    avatars={[
                      { id: 1, src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', name: 'John Doe' },
                      { id: 2, src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', name: 'Jane Smith' },
                      { id: 3, src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', name: 'Bob Wilson' },
                      { id: 4, name: 'Alice Brown' },
                      { id: 5, name: 'Charlie Davis' },
                      { id: 6, name: 'Eva Martinez' },
                    ]}
                  />
                  <AvatarGroup
                    size="md"
                    max={3}
                    avatars={[
                      { id: 1, name: 'Anna Lee' },
                      { id: 2, name: 'Brian Smith' },
                      { id: 3, name: 'Carol White' },
                      { id: 4, name: 'Derek Brown' },
                      { id: 5, name: 'Ella Green' },
                    ]}
                  />
                </div>

                <div className="flex items-center gap-8">
                  <AvatarGroup
                    size="lg"
                    max={4}
                    avatars={[
                      { id: 1, src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', name: 'John Doe' },
                      { id: 2, src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', name: 'Jane Smith' },
                      { id: 3, name: 'Bob Wilson' },
                      { id: 4, name: 'Alice Brown' },
                      { id: 5, name: 'Charlie Davis' },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Progress Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">Progress Bars</h2>
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <Progress value={25} showLabel />
              <Progress value={50} variant="success" showLabel />
              <Progress value={75} variant="warning" showLabel />
              <Progress value={90} variant="danger" showLabel />
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-[rgba(255,255,255,0.65)]">Different Sizes:</p>
              <Progress value={60} size="xs" />
              <Progress value={60} size="sm" />
              <Progress value={60} size="md" />
              <Progress value={60} size="lg" />
            </div>
            <div className="flex gap-8">
              <CircularProgress value={25} size="sm" />
              <CircularProgress value={50} size="md" variant="success" />
              <CircularProgress value={75} size="lg" variant="warning" />
              <CircularProgress value={90} size="xl" variant="danger" />
            </div>
          </div>
        </Card>
      </section>

      {/* Tooltips Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">Tooltips</h2>
        <Card className="p-6">
          <div className="flex flex-wrap gap-4">
            <Tooltip content="Tooltip on top" position="top">
              <Button variant="outline">Top</Button>
            </Tooltip>
            <Tooltip content="Tooltip on bottom" position="bottom">
              <Button variant="outline">Bottom</Button>
            </Tooltip>
            <Tooltip content="Tooltip on left" position="left">
              <Button variant="outline">Left</Button>
            </Tooltip>
            <Tooltip content="Tooltip on right" position="right">
              <Button variant="outline">Right</Button>
            </Tooltip>
          </div>
        </Card>
      </section>

      {/* Dropdown Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">Dropdown Menu</h2>
        <Card className="p-6">
          <div className="flex gap-4">
            <Dropdown>
              <Dropdown.Trigger>Options</Dropdown.Trigger>
              <Dropdown.Menu>
                <Dropdown.Label>Actions</Dropdown.Label>
                <Dropdown.Item icon={Eye}>View Details</Dropdown.Item>
                <Dropdown.Item icon={Edit}>Edit</Dropdown.Item>
                <Dropdown.Item icon={Download}>Download</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item icon={Trash2} danger>Delete</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Dropdown>
              <Dropdown.Trigger>Settings</Dropdown.Trigger>
              <Dropdown.Menu align="right">
                <Dropdown.Item icon={User}>Profile</Dropdown.Item>
                <Dropdown.Item icon={Settings}>Settings</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item danger>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Card>
      </section>

      {/* Breadcrumb Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">Breadcrumb</h2>
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)] mb-3">Basic Breadcrumb</h3>
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Products', href: '/products' },
                { label: 'Electronics', href: '/products/electronics' },
                { label: 'Laptops' },
              ]}
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)] mb-3">Without Home Icon</h3>
            <Breadcrumb
              showHome={false}
              items={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Settings', href: '/settings' },
                { label: 'Profile' },
              ]}
            />
          </div>
        </Card>
      </section>

      {/* Tabs Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">Tabs</h2>
        <Card className="p-6">
          <Tabs defaultValue="tab1">
            <Tabs.List>
              <Tabs.Trigger value="tab1">Profile</Tabs.Trigger>
              <Tabs.Trigger value="tab2">Settings</Tabs.Trigger>
              <Tabs.Trigger value="tab3">Notifications</Tabs.Trigger>
              <Tabs.Trigger value="tab4" disabled>Disabled</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="tab1">
              <div className="space-y-4">
                <h3 className="font-medium dark:text-[rgba(255,255,255,0.85)]">Profile Information</h3>
                <p className="text-gray-600 dark:text-[rgba(255,255,255,0.65)]">
                  This is the profile tab content. You can add any content here including forms,
                  tables, or any other components.
                </p>
                <div className="flex gap-4">
                  <Avatar size="lg" name="John Doe" />
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-gray-600 dark:text-[rgba(255,255,255,0.65)]">Administrator</p>
                  </div>
                </div>
              </div>
            </Tabs.Content>
            <Tabs.Content value="tab2">
              <div className="space-y-4">
                <h3 className="font-medium dark:text-[rgba(255,255,255,0.85)]">Settings</h3>
                <div className="space-y-3">
                  <Switch label="Enable notifications" checked />
                  <Switch label="Dark mode" />
                  <Switch label="Auto-save" checked />
                </div>
              </div>
            </Tabs.Content>
            <Tabs.Content value="tab3">
              <div className="space-y-4">
                <h3 className="font-medium dark:text-[rgba(255,255,255,0.85)]">Notification Preferences</h3>
                <div className="space-y-2">
                  <Checkbox label="Email notifications" checked />
                  <Checkbox label="SMS notifications" />
                  <Checkbox label="Push notifications" checked />
                </div>
              </div>
            </Tabs.Content>
          </Tabs>
        </Card>
      </section>

      {/* Modal Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">Modal / Dialog</h2>
        <Card className="p-6">
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Add New Student"
            size="md"
            footer={
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsModalOpen(false)}>
                  Save Student
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              <Input label="Student Name" placeholder="Enter full name" />
              <Input label="Email" type="email" placeholder="Enter email" />
              <Select
                label="Class"
                options={selectOptions}
                placeholder="Select class"
              />
              <RadioGroup
                label="Gender"
                options={radioOptions}
                direction="horizontal"
              />
            </div>
          </Modal>
        </Card>
      </section>

      {/* Drawer Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">Drawer</h2>
        <Card className="p-6">
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => { setDrawerPlacement('left'); setDrawerOpen(true); }}>
              Left Drawer
            </Button>
            <Button onClick={() => { setDrawerPlacement('right'); setDrawerOpen(true); }}>
              Right Drawer
            </Button>
            <Button onClick={() => { setDrawerPlacement('top'); setDrawerOpen(true); }}>
              Top Drawer
            </Button>
            <Button onClick={() => { setDrawerPlacement('bottom'); setDrawerOpen(true); }}>
              Bottom Drawer
            </Button>
          </div>

          <Drawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            title="Drawer Title"
            placement={drawerPlacement}
            footer={
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDrawerOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setDrawerOpen(false)}>
                  Submit
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-[rgba(255,255,255,0.65)]">
                This is the drawer content. You can add any content here including forms,
                lists, or other components.
              </p>
              <Input label="Name" placeholder="Enter your name" />
              <Input label="Email" type="email" placeholder="Enter email" />
              <Textarea label="Message" placeholder="Enter your message..." rows={4} />
            </div>
          </Drawer>
        </Card>
      </section>

      {/* Table Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">Data Table</h2>
        <Table
          title="Recent Orders"
          columns={tableColumns}
          data={tableData}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          selectedRows={selectedRows}
          onSelectRow={setSelectedRows}
          onSelectAll={setSelectedRows}
          selectable
          // View toggle (auto-detected based on gridRender/kanbanColumns)
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          // Grid view
          gridRender={(item) => {
            const statusConfig = {
              'Pending': { variant: 'warning', icon: Clock },
              'Completed': { variant: 'success', icon: CheckCircle2 },
              'Shipped': { variant: 'info', icon: Truck },
              'In Progress': { variant: 'danger', icon: Loader },
            };
            const config = statusConfig[item.status] || { variant: 'default', icon: null };
            return (
              <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <img src={item.image} alt={item.product} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-[rgba(255,255,255,0.85)] truncate">{item.product}</h4>
                    <p className="text-xs text-gray-500 dark:text-[rgba(255,255,255,0.55)]">{item.brand}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-[rgba(255,255,255,0.55)]">Price</span>
                    <span className="font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)]">{item.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-[rgba(255,255,255,0.55)]">Status</span>
                    <Badge variant={config.variant} type="outline" size="sm" icon={config.icon}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          }}
          // Kanban view
          kanbanGroupBy="status"
          kanbanColumns={[
            { key: 'Pending', title: 'Pending', color: 'bg-amber-500' },
            { key: 'In Progress', title: 'In Progress', color: 'bg-rose-500' },
            { key: 'Shipped', title: 'Shipped', color: 'bg-cyan-500' },
            { key: 'Completed', title: 'Completed', color: 'bg-emerald-500' },
          ]}
          kanbanCardRender={(item) => (
            <Card className="p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <img src={item.image} alt={item.product} className="w-8 h-8 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-gray-900 dark:text-[rgba(255,255,255,0.85)] text-sm truncate">{item.product}</h5>
                  <p className="text-xs text-gray-500 dark:text-[rgba(255,255,255,0.55)]">{item.brand}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-[rgba(255,255,255,0.55)]">{item.customerName}</span>
                <span className="font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)]">{item.price}</span>
              </div>
            </Card>
          )}
          onKanbanDrop={(item, newStatus) => {
            setTableData(prev => prev.map(row =>
              row.id === item.id ? { ...row, status: newStatus } : row
            ));
          }}
          // Pagination
          showPagination
          currentPage={currentPage}
          totalPages={10}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          pageSizeLabel="Entries"
        />
      </section>

      {/* Pagination Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">Pagination</h2>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Full Pagination with Page Size */}
            <div>
              <p className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.55)] mb-3">With Page Size Selector</p>
              <Pagination
                currentPage={currentPage}
                totalPages={10}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                pageSizeLabel="Documents"
              />
            </div>

            {/* Without Page Size */}
            <div>
              <p className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.55)] mb-3">Without Page Size Selector</p>
              <Pagination
                currentPage={currentPage}
                totalPages={10}
                onPageChange={setCurrentPage}
                showPageSize={false}
              />
            </div>
          </div>
        </Card>
      </section>

      {/* File Upload Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">File Upload</h2>
        <Card className="p-6 space-y-6">
          {/* Full Width - All Files */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUpload
              label="All Files Upload"
              size="md"
              multiple
              maxFiles={10}
              maxSize={50 * 1024 * 1024}
              dragText="Drag any files here to upload"
              onUpload={(files) => console.log('Uploaded:', files)}
            />
            <FileUpload
              label="Images Only"
              size="md"
              accept="image/*"
              multiple
              maxFiles={10}
              maxSize={50 * 1024 * 1024}
              dragText="Drag images here to upload"
              onUpload={(files) => console.log('Uploaded:', files)}
            />
          </div>

          {/* Size Variants */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FileUpload
              label="Small Size"
              size="sm"
              accept=".csv,.xlsx"
              multiple
              maxSize={4 * 1024 * 1024}
              dragText="Drag files here"
              onUpload={(files) => console.log('Uploaded:', files)}
            />
            <FileUpload
              label="Medium Size (Default)"
              size="md"
              accept="image/*"
              multiple
              maxFiles={5}
              maxSize={2 * 1024 * 1024}
              dragText="Drag images here"
              onUpload={(files) => console.log('Uploaded:', files)}
            />
            <FileUpload
              label="Large Size"
              size="lg"
              accept=".pdf,.doc,.docx"
              multiple
              maxSize={10 * 1024 * 1024}
              dragText="Drag documents here"
              onUpload={(files) => console.log('Uploaded:', files)}
            />
          </div>
        </Card>
      </section>

      {/* Spinner Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">Spinner / Loading</h2>
        <Card className="p-6">
          <div className="space-y-8">
            {/* Spinner */}
            <div>
              <p className="text-sm text-gray-600 dark:text-[rgba(255,255,255,0.65)] mb-3">Spinner (Orbital):</p>
              <div className="flex items-center gap-8">
                <Spinner size="xs" />
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
                <Spinner size="xl" />
              </div>
            </div>

            {/* Bars Loader */}
            <div>
              <p className="text-sm text-gray-600 dark:text-[rgba(255,255,255,0.65)] mb-3">Bars Loader:</p>
              <div className="flex items-end gap-12">
                <BarsLoader size="sm" showText={false} />
                <BarsLoader size="md" showText={false} />
                <BarsLoader size="lg" showText={false} />
                <BarsLoader size="xl" showText={false} />
              </div>
            </div>

            {/* Bars Loader with Text */}
            <div>
              <p className="text-sm text-gray-600 dark:text-[rgba(255,255,255,0.65)] mb-3">Bars Loader with Text:</p>
              <div className="flex items-center gap-16">
                <BarsLoader size="md" />
                <BarsLoader size="lg" text="PLEASE WAIT" />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Collapse Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">Collapse / Accordion</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Collapse */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Basic Collapse</h3>
            <Collapse title="What is your return policy?">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We offer a 30-day return policy for all unused items in their original packaging. Contact our support team to initiate a return.
              </p>
            </Collapse>
            <Collapse title="How long does shipping take?" defaultOpen>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Standard shipping takes 5-7 business days. Express shipping is available for 2-3 business day delivery.
              </p>
            </Collapse>
            <Collapse title="Do you offer international shipping?" icon={<Globe size={16} />}>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Yes, we ship to over 50 countries worldwide. Shipping rates and delivery times vary by location.
              </p>
            </Collapse>
          </div>

          {/* Collapse with suffix & borderless */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">With Suffix & Borderless</h3>
            <Collapse
              title="User Management"
              icon={<Users size={16} />}
              suffix={<Badge variant="info" type="soft" size="sm">3 permissions</Badge>}
            >
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">users.create</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">users.read</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">users.delete</p>
              </div>
            </Collapse>
            <Collapse title="Borderless collapse item" bordered={false}>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This collapse has no border styling, useful for nested or minimal layouts.
              </p>
            </Collapse>
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-4">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <Card.Header>
              <h3 className="font-semibold dark:text-[rgba(255,255,255,0.85)]">Card Title</h3>
            </Card.Header>
            <Card.Body>
              <p className="text-gray-600 dark:text-[rgba(255,255,255,0.65)]">
                This is a basic card with header.
              </p>
            </Card.Body>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-gray-600 dark:text-[rgba(255,255,255,0.65)]">Total Students</p>
              </div>
            </div>
          </Card>

          <Card>
            <Card.Header>
              <h3 className="font-semibold dark:text-[rgba(255,255,255,0.85)]">With Footer</h3>
            </Card.Header>
            <Card.Body>
              <p className="text-gray-600 dark:text-[rgba(255,255,255,0.65)]">Card content goes here.</p>
            </Card.Body>
            <Card.Footer>
              <Button size="sm" variant="outline" className="w-full">
                View Details
              </Button>
            </Card.Footer>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default UIComponentsPage;
