import React, { useState, useEffect } from 'react';
import { Users, Bell, RefreshCw, UserPlus, UserMinus, Check, X, Send, MapPin, Coffee, BookOpen, Utensils, Dumbbell, Edit, Settings, HelpCircle, LogOut, ChevronRight, Search, Zap } from 'lucide-react';

const TMU_CAMPUS = {
  lat: 43.6577,
  lng: -79.3788,
  radius: 0.5
};

const tmuPrograms = [
  "Aerospace Engineering", "Architectural Science", "Biomedical Engineering", "Chemical Engineering",
  "Civil Engineering", "Computer Engineering", "Electrical Engineering", "Industrial Engineering",
  "Mechanical Engineering", "Accounting and Finance", "Business Management", 
  "Business Technology Management", "Economics and Management Science", "Entrepreneurship",
  "Global Management Studies", "Hospitality and Tourism Management", "Human Resources Management",
  "Law and Business", "Marketing Management", "Real Estate Management", "Retail Management",
  "Applied Chemistry and Biology", "Biomedical Sciences", "Chemistry", "Computer Science",
  "Financial Mathematics", "Mathematics and Its Applications", "Medical Physics",
  "Undeclared Science", "Creative Industries", "Fashion", "Graphic Communications Management",
  "Image Arts", "Interior Design", "Journalism", "Media Production", "Performance",
  "Professional Communication", "RTA School of Media", "Sports Media", "Child and Youth Care",
  "Criminal Justice", "Disability Studies", "Early Childhood Studies", "Health Administration",
  "Midwifery", "Nursing", "Nutrition and Food", "Occupational and Public Health",
  "Psychology", "Social Work", "Urban and Regional Planning", "Arts and Contemporary Studies",
  "Criminology", "English", "Geographic Analysis", "History", 
  "Language and Intercultural Relations", "Philosophy", "Politics and Governance",
  "Professional Music", "Sociology", "Undeclared Arts", "Other"
];

const CampusConnect = () => {
  const [page, setPage] = useState('auth');
  const [currentTab, setCurrentTab] = useState('home');
  const [friendsTab, setFriendsTab] = useState('friends');
  const [showWelcome, setShowWelcome] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [usernameOptions, setUsernameOptions] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [customUsername, setCustomUsername] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    year: '',
    program: '',
    gender: '',
    photoUrl: ''
  });
  
  const [isOnCampus, setIsOnCampus] = useState(false);
  const [campusMode, setCampusMode] = useState('auto');
  const [manuallyOff, setManuallyOff] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [myConnections, setMyConnections] = useState([]);
  const [pendingIncoming, setPendingIncoming] = useState([]);
  const [invites, setInvites] = useState({ received: [], sent: [], upcoming: [] });
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [customActivity, setCustomActivity] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);

  const activities = [
    { label: 'Study', icon: BookOpen, value: 'study' },
    { label: 'Coffee', icon: Coffee, value: 'coffee' },
    { label: 'Lunch', icon: Utensils, value: 'lunch' },
    { label: 'Gym', icon: Dumbbell, value: 'gym' },
    { label: 'Other', icon: Edit, value: 'other' }
  ];

  const locations = [
    { label: 'TRSM', value: 'TRSM', hasFloors: true, floors: ['Floor 7', 'Floor 8', 'Floor 9'] },
    { label: 'SLC', value: 'SLC', hasFloors: true, floors: ['Ground Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor', '6th Floor', '7th Floor', '8th Floor'] },
    { label: 'MAC', value: 'MAC', hasFloors: false },
    { label: 'RAC', value: 'RAC', hasFloors: false },
    { label: 'Other', value: 'Other', hasFloors: false }
  ];

  const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduate', 'Other'];
useEffect(() => {
    checkSession();
    checkLocation();
    loadMockData();
    
    const locationInterval = setInterval(checkLocation, 30000);
    return () => clearInterval(locationInterval);
  }, []);

  useEffect(() => {
    if (user && page === 'app') {
      loadUserData();
    }
  }, [user, page]);

  useEffect(() => {
    if (searchQuery.length > 0) {
      handleSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, allUsers]);

  const checkSession = () => {
    const stored = localStorage.getItem('cc_user');
    if (stored) {
      setUser(JSON.parse(stored));
      const hasSeenTutorial = localStorage.getItem('cc_tutorial_seen');
      if (!hasSeenTutorial) {
        setShowTutorial(true);
      }
      setPage('app');
    }
  };

  const checkLocation = () => {
    if (campusMode === 'manual') return;
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const distance = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            TMU_CAMPUS.lat,
            TMU_CAMPUS.lng
          );
          const onCampus = distance <= TMU_CAMPUS.radius;
          setIsOnCampus(onCampus && !manuallyOff);
          if (user) {
            localStorage.setItem('cc_status_' + user.id, JSON.stringify({ isOnCampus: onCampus && !manuallyOff }));
          }
        },
        (error) => {
          console.log('Location access denied');
        }
      );
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const toggleCampusMode = () => {
    if (campusMode === 'auto' && isOnCampus) {
      setCampusMode('manual');
      setManuallyOff(true);
      setIsOnCampus(false);
    } else {
      setCampusMode('auto');
      setManuallyOff(false);
      checkLocation();
    }
  };

  const loadMockData = () => {
    const mockUsers = [
      { id: '1', username: 'john.smith', name: 'John Smith', year: '3rd Year', program: 'Computer Science', gender: 'Male', photoUrl: '', isOnCampus: true },
      { id: '2', username: 'sarah.wilson', name: 'Sarah Wilson', year: '3rd Year', program: 'Computer Science', gender: 'Female', photoUrl: '', isOnCampus: true },
      { id: '3', username: 'marcus.patel', name: 'Marcus Patel', year: '2nd Year', program: 'Business Management', gender: 'Male', photoUrl: '', isOnCampus: false },
      { id: '4', username: 'priya.chen', name: 'Priya Chen', year: '4th Year', program: 'Engineering', gender: 'Female', photoUrl: '', isOnCampus: false },
      { id: '5', username: 'alex.kumar', name: 'Alex Kumar', year: '3rd Year', program: 'Computer Science', gender: 'Male', photoUrl: '', isOnCampus: true },
      { id: '6', username: 'lisa.zhang', name: 'Lisa Zhang', year: '3rd Year', program: 'Engineering', gender: 'Female', photoUrl: '', isOnCampus: false }
    ];
    setAllUsers(mockUsers);
  };

  const loadUserData = () => {
    const connections = JSON.parse(localStorage.getItem('cc_connections_' + user.id) || '["1", "2"]');
    const incoming = JSON.parse(localStorage.getItem('cc_pending_incoming_' + user.id) || '["6"]');
    
    setMyConnections(connections);
    setPendingIncoming(incoming);
    
    const storedInvites = JSON.parse(localStorage.getItem('cc_invites_' + user.id) || '{"received":[],"sent":[],"upcoming":[]}');
    setInvites(storedInvites);
  };

  const handleSearch = (query) => {
    const lowerQuery = query.toLowerCase();
    const results = allUsers.filter(u => {
      if (u.id === user?.id) return false;
      const fullName = u.name.toLowerCase();
      const username = u.username.toLowerCase();
      const firstName = fullName.split(' ')[0];
      const lastName = fullName.split(' ').slice(1).join(' ');
      
      return fullName.includes(lowerQuery) ||
             username.includes(lowerQuery) ||
             firstName.includes(lowerQuery) ||
             lastName.includes(lowerQuery);
    });
    setSearchResults(results.slice(0, 10));
  };

  const handleAuth = () => {
    setError('');
    if (!email.endsWith('@torontomu.ca')) {
      setError('Please use your TMU email');
      return;
    }
    setShowWelcome(false);
    setAwaitingVerification(true);
  };

  const verifyCode = () => {
    if (verificationCode.length === 6) {
      const emailPart = email.split('@')[0];
      const parts = emailPart.split('.');
      
      const options = [
        emailPart,
        emailPart.replace('.', '_'),
        parts[0][0] + '.' + parts[parts.length - 1],
        emailPart.replace('.', '')
      ];
      
      setUsernameOptions(options);
      setSelectedUsername(options[0]);
      setPage('username');
    } else {
      setError('Invalid verification code');
    }
  };

  const handleUsernameSelection = () => {
    const finalUsername = selectedUsername === 'custom' ? customUsername : selectedUsername;
    if (!finalUsername || finalUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email: email,
      username: finalUsername
    };
    
    setUser(newUser);
    setPage('onboarding');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, photoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const completeOnboarding = () => {
    if (!profile.name || !profile.year || !profile.program || !profile.gender || !profile.photoUrl) {
      setError('Please complete all fields and upload a photo');
      return;
    }
    
    const completeUser = { ...user, ...profile };
    localStorage.setItem('cc_user', JSON.stringify(completeUser));
    setUser(completeUser);
    setShowTutorial(true);
    setPage('app');
  };

  const completeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('cc_tutorial_seen', 'true');
  };

  const handleSendRequest = (userId) => {
    const newIncoming = [...pendingIncoming];
    if (!newIncoming.includes(userId)) {
      setPendingIncoming([...pendingIncoming, userId]);
      localStorage.setItem('cc_pending_incoming_' + userId, JSON.stringify([...pendingIncoming, user.id]));
    }
  };

  const handleAcceptRequest = (userId) => {
    const newConnections = [...myConnections, userId];
    const newIncoming = pendingIncoming.filter(id => id !== userId);
    setMyConnections(newConnections);
    setPendingIncoming(newIncoming);
    localStorage.setItem('cc_connections_' + user.id, JSON.stringify(newConnections));
    localStorage.setItem('cc_pending_incoming_' + user.id, JSON.stringify(newIncoming));
  };

  const handleDeclineRequest = (userId) => {
    const newIncoming = pendingIncoming.filter(id => id !== userId);
    setPendingIncoming(newIncoming);
    localStorage.setItem('cc_pending_incoming_' + user.id, JSON.stringify(newIncoming));
  };

  const handleRemoveConnection = (userId) => {
    const newConnections = myConnections.filter(id => id !== userId);
    setMyConnections(newConnections);
    localStorage.setItem('cc_connections_' + user.id, JSON.stringify(newConnections));
  };

  const togglePersonSelection = (userId) => {
    if (!isOnCampus) return;
    if (selectedPeople.includes(userId)) {
      setSelectedPeople(selectedPeople.filter(id => id !== userId));
    } else {
      setSelectedPeople([...selectedPeople, userId]);
    }
  };

  const openInviteModal = () => {
    if (selectedPeople.length === 0) return;
    setShowInviteModal(true);
  };

  const sendInvites = () => {
    const activity = selectedActivity === 'other' ? customActivity : activities.find(a => a.value === selectedActivity)?.label;
    let locationStr = selectedLocation;
    
    const locationObj = locations.find(l => l.value === selectedLocation);
    if (locationObj?.hasFloors && selectedFloor) {
      locationStr = selectedLocation + ' - ' + selectedFloor;
    } else if (selectedLocation === 'Other') {
      locationStr = customLocation;
    }
    
    const newSentInvites = selectedPeople.map(personId => ({
      id: Math.random().toString(36).substr(2, 9),
      from: user.id,
      to: personId,
      activity,
      location: locationStr,
      status: 'pending',
      timestamp: Date.now()
    }));
    
    const updatedInvites = {
      ...invites,
      sent: [...invites.sent, ...newSentInvites]
    };
    
    setInvites(updatedInvites);
    localStorage.setItem('cc_invites_' + user.id, JSON.stringify(updatedInvites));
    setShowInviteModal(false);
    setSelectedPeople([]);
    setSelectedActivity('');
    setSelectedLocation('');
    setSelectedFloor('');
  };

  const handleInviteResponse = (inviteId, response) => {
    const updatedReceived = invites.received.filter(inv => inv.id !== inviteId);
    let updatedUpcoming = invites.upcoming;
    
    if (response === 'accepted') {
      const invite = invites.received.find(inv => inv.id === inviteId);
      updatedUpcoming = [...updatedUpcoming, { ...invite, status: 'accepted' }];
    }
    
    const updatedInvites = {
      ...invites,
      received: updatedReceived,
      upcoming: updatedUpcoming
    };
    
    setInvites(updatedInvites);
    localStorage.setItem('cc_invites_' + user.id, JSON.stringify(updatedInvites));
  };

  const getConnections = () => {
    return allUsers.filter(u => u.id !== user?.id && myConnections.includes(u.id));
  };

  const getOnCampusConnections = () => {
    return getConnections()
      .filter(u => u.isOnCampus)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const getAllConnections = () => {
    const connections = getConnections();
    const onCampus = connections.filter(u => u.isOnCampus).sort((a, b) => a.name.localeCompare(b.name));
    const offCampus = connections.filter(u => !u.isOnCampus).sort((a, b) => a.name.localeCompare(b.name));
    return [...onCampus, ...offCampus];
  };

  const getDiscoverUsers = () => {
    const nonConnections = allUsers.filter(u => 
      u.id !== user?.id && 
      !myConnections.includes(u.id) &&
      !pendingIncoming.includes(u.id)
    );
    
    return nonConnections.map(u => {
      let score = 0;
      if (u.program === profile.program) score += 35;
      if (u.year === profile.year) score += 25;
      if (u.gender !== profile.gender) score += 20;
      if (u.isOnCampus) score += 10;
      return { ...u, score };
    }).sort((a, b) => b.score - a.score);
  };

  const getUserById = (id) => allUsers.find(u => u.id === id);

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setPage('auth');
  };// WELCOME SCREEN
  if (page === 'auth' && showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Users className="w-14 h-14 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Welcome to Campus Connect!
            </h1>
            <p className="text-gray-600 text-lg mb-8">Meet TMU students on campus, right now.</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Auto-detects when you're on campus</h3>
                <p className="text-sm text-gray-600">No manual check-ins needed</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">See your friends who are around</h3>
                <p className="text-sm text-gray-600">Real-time campus presence</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                <Coffee className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Send quick invites to meet up</h3>
                <p className="text-sm text-gray-600">Study, coffee, gym, or just hang out</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">TMU students only</h3>
                <p className="text-sm text-gray-600">Verified @torontomu.ca emails</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowWelcome(false)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition transform hover:scale-105"
          >
            Get Started →
          </button>
        </div>
      </div>
    );
  }
  // AUTH PAGE
  if (page === 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h1>
            <p className="text-gray-600">Enter your TMU email to continue</p>
          </div>

          {!awaitingVerification ? (
            <div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">TMU Email</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="firstname.lastname"
                    value={email.replace('@torontomu.ca', '')}
                    onChange={(e) => setEmail(e.target.value + '@torontomu.ca')}
                    className="w-full px-4 py-3 pr-32 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <div className="absolute right-4 top-3 text-sm text-gray-400">@torontomu.ca</div>
                </div>
              </div>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <button
                onClick={handleAuth}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition"
              >
                Continue →
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4 text-center">
                We sent a code to <span className="font-semibold">{email}</span>
              </p>
              <input
                type="text"
                placeholder="000000"
                maxLength="6"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl mb-4 text-center text-3xl tracking-widest font-bold focus:ring-2 focus:ring-blue-500"
              />
              {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
              <button
                onClick={verifyCode}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition"
              >
                Verify & Continue
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // USERNAME PAGE
  if (page === 'username') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Pick your username</h2>
          <p className="text-gray-600 mb-6">This is how others will find you</p>
          
          <div className="space-y-3 mb-6">
            {usernameOptions.map(option => (
              <label key={option} className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition">
                <input
                  type="radio"
                  name="username"
                  value={option}
                  checked={selectedUsername === option}
                  onChange={(e) => setSelectedUsername(e.target.value)}
                  className="mr-3 w-5 h-5"
                />
                <span className="font-semibold text-lg">@{option}</span>
              </label>
            ))}
            
            <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition">
              <input
                type="radio"
                name="username"
                value="custom"
                checked={selectedUsername === 'custom'}
                onChange={(e) => setSelectedUsername(e.target.value)}
                className="mr-3 w-5 h-5"
              />
              <span className="font-semibold">Custom:</span>
              {selectedUsername === 'custom' && (
                <input
                  type="text"
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                  placeholder="your_username"
                  className="ml-2 flex-1 px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              )}
            </label>
          </div>
          
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          
          <button
            onClick={handleUsernameSelection}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition"
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  // ONBOARDING PAGE
  if (page === 'onboarding') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 max-h-screen overflow-y-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Profile</h2>
          <p className="text-gray-600 mb-6">Just a few quick details</p>
          
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Profile Photo</label>
            <div className="flex items-center gap-4">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-blue-100" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Users className="w-12 h-12 text-white" />
                </div>
              )}
              <label className="cursor-pointer bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition font-semibold">
                {profile.photoUrl ? 'Change' : 'Upload'}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
          </div>
          
          <input
            type="text"
            placeholder="Full Name"
            value={profile.name}
            onChange={(e) => setProfile({...profile, name: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={profile.year}
            onChange={(e) => setProfile({...profile, year: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Year</option>
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          {profile.year === 'Other' && (
            <input
              type="text"
              placeholder="Enter your year"
              onChange={(e) => setProfile({...profile, year: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500"
            />
          )}
          
          <select
            value={profile.program}
            onChange={(e) => setProfile({...profile, program: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Program</option>
            {tmuPrograms.map(program => (
              <option key={program} value={program}>{program}</option>
            ))}
          </select>
          
          <select
            value={profile.gender}
            onChange={(e) => setProfile({...profile, gender: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-6 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
          
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          
          <button
            onClick={completeOnboarding}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition"
          >
            Let's Go! 🎉
          </button>
        </div>
      </div>
    );
  }

  // TUTORIAL SCREENS
  if (showTutorial) {
    const tutorials = [
      {
        icon: MapPin,
        title: "We'll detect when you're on campus",
        description: "Campus Connect checks if you’re near TMU to know when you’re on campus. Your exact location is never tracked or stored.",
        color: "from-blue-500 to-blue-600"
      },
      {
        icon: Users,
        title: "See your friends who are around",
        description: "Check who's on campus right now and send them a quick invite to meet up.",
        color: "from-purple-500 to-purple-600"
      },
      {
        icon: Coffee,
        title: "Send quick invites",
        description: "Invite friends to study, grab coffee, hit the gym, or just hang out. It's that simple!",
        color: "from-pink-500 to-pink-600"
      },
      {
        icon: Search,
        title: "Discover new people",
        description: "Find and connect with other TMU students based on your program, year, and interests.",
        color: "from-green-500 to-green-600"
      }
    ];

    const currentTutorial = tutorials[tutorialStep];
    const Icon = currentTutorial.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className={`w-24 h-24 bg-gradient-to-br ${currentTutorial.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <Icon className="w-14 h-14 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">{currentTutorial.title}</h2>
            <p className="text-gray-600 text-lg">{currentTutorial.description}</p>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            {tutorials.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === tutorialStep ? 'w-8 bg-blue-500' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {tutorialStep < tutorials.length - 1 ? (
              <>
                <button
                  onClick={completeTutorial}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                >
                  Skip
                </button>
                <button
                  onClick={() => setTutorialStep(tutorialStep + 1)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
                >
                  Next
                </button>
              </>
            ) : (
              <button
                onClick={completeTutorial}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
              >
                Start Exploring! 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
// WELCOME SCREEN
  if (page === 'auth' && showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Users className="w-14 h-14 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Welcome to Campus Connect!
            </h1>
            <p className="text-gray-600 text-lg mb-8">Meet TMU students on campus, right now.</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Auto-detects when you're on campus</h3>
                <p className="text-sm text-gray-600">No manual check-ins needed</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">See your friends who are around</h3>
                <p className="text-sm text-gray-600">Real-time campus presence</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                <Coffee className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Send quick invites to meet up</h3>
                <p className="text-sm text-gray-600">Study, coffee, gym, or just hang out</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">TMU students only</h3>
                <p className="text-sm text-gray-600">Verified @torontomu.ca emails</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowWelcome(false)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition transform hover:scale-105"
          >
            Get Started →
          </button>
        </div>
      </div>
    );
  }

  // AUTH PAGE
  if (page === 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h1>
            <p className="text-gray-600">Enter your TMU email to continue</p>
          </div>

          {!awaitingVerification ? (
            <div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">TMU Email</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="firstname.lastname"
                    value={email.replace('@torontomu.ca', '')}
                    onChange={(e) => setEmail(e.target.value + '@torontomu.ca')}
                    className="w-full px-4 py-3 pr-32 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <div className="absolute right-4 top-3 text-sm text-gray-400">@torontomu.ca</div>
                </div>
              </div>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <button
                onClick={handleAuth}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition"
              >
                Continue →
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4 text-center">
                We sent a code to <span className="font-semibold">{email}</span>
              </p>
              <input
                type="text"
                placeholder="000000"
                maxLength="6"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl mb-4 text-center text-3xl tracking-widest font-bold focus:ring-2 focus:ring-blue-500"
              />
              {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
              <button
                onClick={verifyCode}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition"
              >
                Verify & Continue
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // USERNAME PAGE
  if (page === 'username') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Pick your username</h2>
          <p className="text-gray-600 mb-6">This is how others will find you</p>
          
          <div className="space-y-3 mb-6">
            {usernameOptions.map(option => (
              <label key={option} className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition">
                <input
                  type="radio"
                  name="username"
                  value={option}
                  checked={selectedUsername === option}
                  onChange={(e) => setSelectedUsername(e.target.value)}
                  className="mr-3 w-5 h-5"
                />
                <span className="font-semibold text-lg">@{option}</span>
              </label>
            ))}
            
            <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition">
              <input
                type="radio"
                name="username"
                value="custom"
                checked={selectedUsername === 'custom'}
                onChange={(e) => setSelectedUsername(e.target.value)}
                className="mr-3 w-5 h-5"
              />
              <span className="font-semibold">Custom:</span>
              {selectedUsername === 'custom' && (
                <input
                  type="text"
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                  placeholder="your_username"
                  className="ml-2 flex-1 px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              )}
            </label>
          </div>
          
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          
          <button
            onClick={handleUsernameSelection}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition"
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  // ONBOARDING PAGE
  if (page === 'onboarding') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 max-h-screen overflow-y-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Profile</h2>
          <p className="text-gray-600 mb-6">Just a few quick details</p>
          
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Profile Photo</label>
            <div className="flex items-center gap-4">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-blue-100" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Users className="w-12 h-12 text-white" />
                </div>
              )}
              <label className="cursor-pointer bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition font-semibold">
                {profile.photoUrl ? 'Change' : 'Upload'}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
          </div>
          
          <input
            type="text"
            placeholder="Full Name"
            value={profile.name}
            onChange={(e) => setProfile({...profile, name: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={profile.year}
            onChange={(e) => setProfile({...profile, year: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Year</option>
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          {profile.year === 'Other' && (
            <input
              type="text"
              placeholder="Enter your year"
              onChange={(e) => setProfile({...profile, year: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500"
            />
          )}
          
          <select
            value={profile.program}
            onChange={(e) => setProfile({...profile, program: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Program</option>
            {tmuPrograms.map(program => (
              <option key={program} value={program}>{program}</option>
            ))}
          </select>
          
          <select
            value={profile.gender}
            onChange={(e) => setProfile({...profile, gender: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-6 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
          
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          
          <button
            onClick={completeOnboarding}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition"
          >
            Let's Go! 🎉
          </button>
        </div>
      </div>
    );
  }

  // TUTORIAL SCREENS
  if (showTutorial) {
    const tutorials = [
      {
        icon: MapPin,
        title: "We'll detect when you're on campus",
        description: "Campus Connect automatically checks if you’re near TMU to know when you’re on campus. Your exact location is never tracked or stored.",
        color: "from-blue-500 to-blue-600"
      },
      {
        icon: Users,
        title: "See your friends who are around",
        description: "Check who's on campus right now and send them a quick invite to meet up.",
        color: "from-purple-500 to-purple-600"
      },
      {
        icon: Coffee,
        title: "Send quick invites",
        description: "Invite friends to study, grab coffee, hit the gym, or just hang out. It's that simple!",
        color: "from-pink-500 to-pink-600"
      },
      {
        icon: Search,
        title: "Discover new people",
        description: "Find and connect with other TMU students based on your program, year, and interests.",
        color: "from-green-500 to-green-600"
      }
    ];

    const currentTutorial = tutorials[tutorialStep];
    const Icon = currentTutorial.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className={`w-24 h-24 bg-gradient-to-br ${currentTutorial.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <Icon className="w-14 h-14 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">{currentTutorial.title}</h2>
            <p className="text-gray-600 text-lg">{currentTutorial.description}</p>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            {tutorials.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === tutorialStep ? 'w-8 bg-blue-500' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {tutorialStep < tutorials.length - 1 ? (
              <>
                <button
                  onClick={completeTutorial}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                >
                  Skip
                </button>
                <button
                  onClick={() => setTutorialStep(tutorialStep + 1)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
                >
                  Next
                </button>
              </>
            ) : (
              <button
                onClick={completeTutorial}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
              >
                Start Exploring! 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
// HOME TAB RENDER
  const renderHome = () => (
    <div>
      {/* Active Invites Section */}
      {invites.received.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            ACTIVE INVITES ({invites.received.length})
          </h3>
          <div className="space-y-3">
            {invites.received.map(invite => {
              const person = getUserById(invite.from);
              return (
                <div key={invite.id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm">
                      {getInitials(person?.name || 'U')}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{person?.name}</div>
                      <div className="text-sm text-gray-600">wants to {invite.activity.toLowerCase()}</div>
                      <div className="text-sm text-gray-500">📍 {invite.location}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleInviteResponse(invite.id, 'accepted')}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-semibold"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleInviteResponse(invite.id, 'declined')}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* On Campus Now Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            ON CAMPUS NOW ({getOnCampusConnections().length})
          </span>
          {selectedPeople.length > 0 && (
            <button
              onClick={openInviteModal}
              className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition"
            >
              Invite ({selectedPeople.length})
            </button>
          )}
        </h3>
        
        {getOnCampusConnections().length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No friends on campus right now</p>
            <p className="text-sm text-gray-500 mt-1">They'll appear here when they arrive</p>
          </div>
        ) : (
          <div className="space-y-2">
            {getOnCampusConnections().map(person => (
              <div key={person.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                <input
                  type="checkbox"
                  checked={selectedPeople.includes(person.id)}
                  onChange={() => togglePersonSelection(person.id)}
                  disabled={!isOnCampus}
                  className={'w-5 h-5 rounded cursor-pointer ' + (isOnCampus ? 'text-blue-500' : 'text-gray-300 cursor-not-allowed')}
                />
                <div 
                  onClick={() => setSelectedUserProfile(person)}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                    {getInitials(person.name)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{person.name}</div>
                    <div className="text-sm text-gray-600">@{person.username}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sent/Upcoming Invites */}
      {(invites.sent.length > 0 || invites.upcoming.length > 0) && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-bold text-gray-800 mb-3">YOUR INVITES</h3>
          
          {invites.sent.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Sent ({invites.sent.length})</h4>
              <div className="space-y-2">
                {invites.sent.map(invite => {
                  const person = getUserById(invite.to);
                  return (
                    <div key={invite.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm">
                          {getInitials(person?.name || 'U')}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">You → {person?.name}</div>
                          <div className="text-sm text-gray-600">{invite.activity} • {invite.location}</div>
                        </div>
                      </div>
                      <div className="text-sm text-yellow-600 font-medium">⏳ Pending</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {invites.upcoming.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Upcoming ({invites.upcoming.length})</h4>
              <div className="space-y-2">
                {invites.upcoming.map(invite => {
                  const person = getUserById(invite.from === user.id ? invite.to : invite.from);
                  return (
                    <div key={invite.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold text-sm">
                          {getInitials(person?.name || 'U')}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{invite.activity} with {person?.name}</div>
                          <div className="text-sm text-gray-600">📍 {invite.location}</div>
                        </div>
                      </div>
                      <button className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-semibold">
                        I'm Here
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // FRIENDS TAB RENDER
  const renderFriends = () => (
    <div>
      {/* Search Bar */}
      <div className="mb-4 relative">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or @username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* Search Results Dropdown */}
        {searchQuery.length > 0 && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto">
            {searchResults.map(person => {
              const isConnected = myConnections.includes(person.id);
              const isPending = pendingIncoming.includes(person.id);
              
              return (
                <div
                  key={person.id}
                  onClick={() => {
                    setSelectedUserProfile(person);
                    setSearchQuery('');
                  }}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                      {getInitials(person.name)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{person.name}</div>
                      <div className="text-sm text-gray-600">@{person.username}</div>
                      <div className="text-xs text-gray-500">{person.year} • {person.program}</div>
                    </div>
                  </div>
                  <div className="text-sm">
                    {isConnected ? (
                      <span className="text-green-600 font-medium">✓ Friends</span>
                    ) : isPending ? (
                      <span className="text-blue-600 font-medium">Requested</span>
                    ) : (
                      <UserPlus className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Friend Requests Section */}
      {pendingIncoming.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            FRIEND REQUESTS ({pendingIncoming.length})
          </h3>
          <div className="space-y-3">
            {pendingIncoming.map(userId => {
              const person = getUserById(userId);
              if (!person) return null;
              return (
                <div key={userId} className="flex items-center justify-between">
                  <div 
                    onClick={() => setSelectedUserProfile(person)}
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                      {getInitials(person.name)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{person.name}</div>
                      <div className="text-sm text-gray-600">{person.year} • {person.program}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAcceptRequest(userId)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-semibold"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleDeclineRequest(userId)}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-tabs */}
      <div className="flex gap-4 mb-4 border-b">
        <button
          onClick={() => setFriendsTab('friends')}
          className={'pb-3 px-2 font-medium transition ' + (friendsTab === 'friends' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600')}
        >
          Your Friends ({myConnections.length})
        </button>
        <button
          onClick={() => setFriendsTab('discover')}
          className={'pb-3 px-2 font-medium transition ' + (friendsTab === 'discover' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600')}
        >
          Discover
        </button>
      </div>

      {friendsTab === 'friends' && (
        <div className="space-y-2">
          {getAllConnections().length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">No friends yet</p>
              <p className="text-sm text-gray-500">Use the search bar above or check out Discover</p>
            </div>
          ) : (
            getAllConnections().map(person => (
              <div 
                key={person.id}
                onClick={() => setSelectedUserProfile(person)}
                className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                  {getInitials(person.name)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{person.name}</div>
                  <div className="text-sm text-gray-600">@{person.username}</div>
                  <div className={'text-sm flex items-center gap-1 mt-1 ' + (person.isOnCampus ? 'text-green-600' : 'text-gray-500')}>
                    <MapPin className="w-4 h-4" />
                    {person.isOnCampus ? 'On Campus' : 'Off Campus'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {friendsTab === 'discover' && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3">DISCOVER</h3>
          <div className="space-y-3">
            {getDiscoverUsers().slice(0, 8).map(person => (
              <div key={person.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                <div 
                  onClick={() => setSelectedUserProfile(person)}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center font-semibold">
                    {getInitials(person.name)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{person.name}</div>
                    <div className="text-sm text-gray-600">{person.year} • {person.program}</div>
                    {person.isOnCampus && (
                      <div className="text-sm text-green-600 flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        On campus now
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => handleSendRequest(person.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-1 font-semibold"
                >
                  <UserPlus className="w-4 h-4" />
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
const renderProfile = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        {profile.photoUrl ? (
          <img src={profile.photoUrl} alt="Profile" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-blue-500 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4">
            {getInitials(profile.name)}
          </div>
        )}
        <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
        <p className="text-gray-600">@{user?.username}</p>
        <p className="text-sm text-gray-500 mt-2">{profile.year} • {profile.program}</p>
        <p className="text-sm text-gray-500">{user?.email}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-3">Stats</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-500">{myConnections.length}</div>
            <div className="text-sm text-gray-600">Friends</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-500">{invites.upcoming.length}</div>
            <div className="text-sm text-gray-600">Meetups</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm divide-y">
        <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
          <div className="flex items-center gap-3">
            <Edit className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">Edit Profile</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">Settings</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">Help & Support</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        <button onClick={logout} className="w-full px-6 py-4 flex items-center gap-3 hover:bg-gray-50 transition text-red-500">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );

  // MAIN APP LAYOUT
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Hey {profile.name?.split(' ')[0]}! 👋</h1>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-green-600 text-sm font-medium px-3 py-2 bg-green-50 rounded-lg">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications On</span>
            </button>
            <button onClick={() => checkLocation()} className="p-2 hover:bg-gray-100 rounded-lg">
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={() => setCurrentTab('profile')} className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
              {getInitials(profile.name)}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {currentTab === 'home' && (
          <button
            onClick={toggleCampusMode}
            className="w-full bg-white rounded-xl shadow-sm p-6 mb-4 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={'w-16 h-16 rounded-full flex items-center justify-center ' + (isOnCampus ? 'bg-green-100' : 'bg-gray-100')}>
                  <MapPin className={'w-8 h-8 ' + (isOnCampus ? 'text-green-600' : 'text-gray-600')} />
                </div>
                <div className="text-left">
                  <h3 className={'text-xl font-bold ' + (isOnCampus ? 'text-green-600' : 'text-gray-800')}>
                    {isOnCampus ? 'On TMU Campus' : 'Off Campus'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {campusMode === 'manual' ? 'Manual override' : 'Auto-tracking'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">{campusMode === 'manual' ? 'Manual' : 'Auto'}</span>
              </div>
            </div>
          </button>
        )}

        {currentTab === 'home' && renderHome()}
        {currentTab === 'friends' && renderFriends()}
        {currentTab === 'profile' && renderProfile()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-around">
          <button
            onClick={() => setCurrentTab('home')}
            className={'flex flex-col items-center gap-1 ' + (currentTab === 'home' ? 'text-blue-500' : 'text-gray-600')}
          >
            <MapPin className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
            {invites.received.length > 0 && (
              <div className="absolute top-1 right-1/3 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {invites.received.length}
              </div>
            )}
          </button>
          <button
            onClick={() => setCurrentTab('friends')}
            className={'flex flex-col items-center gap-1 relative ' + (currentTab === 'friends' ? 'text-blue-500' : 'text-gray-600')}
          >
            <Users className="w-6 h-6" />
            <span className="text-xs font-medium">Friends</span>
            {pendingIncoming.length > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingIncoming.length}
              </div>
            )}
          </button>
          <button
            onClick={() => setCurrentTab('profile')}
            className={'flex flex-col items-center gap-1 ' + (currentTab === 'profile' ? 'text-blue-500' : 'text-gray-600')}
          >
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
              {getInitials(profile.name)}
            </div>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Send Invite</h3>
              <button onClick={() => setShowInviteModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">What do you want to do?</h4>
              <div className="grid grid-cols-2 gap-3">
                {activities.map(activity => (
                  <button
                    key={activity.value}
                    onClick={() => setSelectedActivity(activity.value)}
                    className={'p-4 border-2 rounded-xl hover:bg-gray-50 transition flex flex-col items-center gap-2 ' + (selectedActivity === activity.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200')}
                  >
                    <activity.icon className="w-8 h-8 text-gray-700" />
                    <span className="font-semibold text-sm">{activity.label}</span>
                  </button>
                ))}
              </div>
              {selectedActivity === 'other' && (
                <input
                  type="text"
                  placeholder="Enter activity"
                  value={customActivity}
                  onChange={(e) => setCustomActivity(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mt-3 focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">Where?</h4>
              <div className="space-y-2">
                {locations.map(location => (
                  <div key={location.value}>
                    <label className="flex items-center p-3 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                      <input
                        type="radio"
                        name="location"
                        value={location.value}
                        checked={selectedLocation === location.value}
                        onChange={(e) => {
                          setSelectedLocation(e.target.value);
                          setSelectedFloor('');
                        }}
                        className="mr-3 w-4 h-4"
                      />
                      <span className="font-medium">{location.label}</span>
                    </label>
                    
                    {selectedLocation === location.value && location.hasFloors && (
                      <select
                        value={selectedFloor}
                        onChange={(e) => setSelectedFloor(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mt-2 ml-8 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Floor</option>
                        {location.floors.map(floor => (
                          <option key={floor} value={floor}>{floor}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
              {selectedLocation === 'Other' && (
                <input
                  type="text"
                  placeholder="Enter location"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mt-3 focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            <button
              onClick={sendInvites}
              disabled={
                !selectedActivity || 
                (selectedActivity === 'other' && !customActivity) ||
                !selectedLocation ||
                (selectedLocation === 'Other' && !customLocation) ||
                (locations.find(l => l.value === selectedLocation)?.hasFloors && !selectedFloor)
              }
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Send Invites
            </button>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {selectedUserProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Profile</h3>
              <button onClick={() => setSelectedUserProfile(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-blue-500 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                {getInitials(selectedUserProfile.name)}
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{selectedUserProfile.name}</h2>
              <p className="text-gray-600">@{selectedUserProfile.username}</p>
              <p className="text-sm text-gray-500 mt-2">{selectedUserProfile.year} • {selectedUserProfile.program}</p>
              {selectedUserProfile.isOnCampus && (
                <div className="inline-flex items-center gap-1 mt-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                  <MapPin className="w-4 h-4" />
                  On Campus
                </div>
              )}
            </div>

            <div className="space-y-2">
              {myConnections.includes(selectedUserProfile.id) ? (
                <>
                  {isOnCampus && selectedUserProfile.isOnCampus && (
                    <button
                      onClick={() => {
                        setSelectedPeople([selectedUserProfile.id]);
                        setSelectedUserProfile(null);
                        setShowInviteModal(true);
                      }}
                      className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition"
                    >
                      Send Invite
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleRemoveConnection(selectedUserProfile.id);
                      setSelectedUserProfile(null);
                    }}
                    className="w-full bg-red-50 text-red-500 py-3 rounded-xl font-semibold hover:bg-red-100 transition"
                  >
                    Remove Friend
                  </button>
                </>
              ) : pendingIncoming.includes(selectedUserProfile.id) ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleAcceptRequest(selectedUserProfile.id);
                      setSelectedUserProfile(null);
                    }}
                    className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      handleDeclineRequest(selectedUserProfile.id);
                      setSelectedUserProfile(null);
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
                  >
                    Decline
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    handleSendRequest(selectedUserProfile.id);
                    setSelectedUserProfile(null);
                  }}
                  className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition"
                >
                  Send Friend Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampusConnect;
