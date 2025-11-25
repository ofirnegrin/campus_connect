import React, { useState, useEffect } from 'react';
import { Users, Bell, RefreshCw, UserPlus, UserMinus, Check, X, Send, MapPin, Coffee, BookOpen, Utensils, Dumbbell, Edit, Settings, HelpCircle, LogOut, ChevronRight, MoreVertical, Zap } from 'lucide-react';

const TMU_CAMPUS = {
  lat: 43.6577,
  lng: -79.3788,
  radius: 0.5
};

const CampusConnect = () => {
  const [page, setPage] = useState('auth');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [dashboardTab, setDashboardTab] = useState('oncampus');
  const [friendsTab, setFriendsTab] = useState('connections');
  const [invitesTab, setInvitesTab] = useState('received');
  
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
  const [pendingOutgoing, setPendingOutgoing] = useState([]);
  const [pendingIncoming, setPendingIncoming] = useState([]);
  const [invites, setInvites] = useState({ received: [], sent: [], upcoming: [] });
  const [error, setError] = useState('');
  
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

  const checkSession = () => {
    const stored = localStorage.getItem('cc_user');
    if (stored) {
      setUser(JSON.parse(stored));
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
      { id: '3', username: 'marcus.patel', name: 'Marcus Patel', year: '2nd Year', program: 'Business', gender: 'Male', photoUrl: '', isOnCampus: false },
      { id: '4', username: 'priya.chen', name: 'Priya Chen', year: '4th Year', program: 'Engineering', gender: 'Female', photoUrl: '', isOnCampus: false },
      { id: '5', username: 'alex.kumar', name: 'Alex Kumar', year: '3rd Year', program: 'Computer Science', gender: 'Non-binary', photoUrl: '', isOnCampus: true },
      { id: '6', username: 'lisa.zhang', name: 'Lisa Zhang', year: '3rd Year', program: 'Engineering', gender: 'Female', photoUrl: '', isOnCampus: false }
    ];
    setAllUsers(mockUsers);
  };

  const loadUserData = () => {
    const connections = JSON.parse(localStorage.getItem('cc_connections_' + user.id) || '["1", "2"]');
    const outgoing = JSON.parse(localStorage.getItem('cc_pending_outgoing_' + user.id) || '[]');
    const incoming = JSON.parse(localStorage.getItem('cc_pending_incoming_' + user.id) || '["6"]');
    
    setMyConnections(connections);
    setPendingOutgoing(outgoing);
    setPendingIncoming(incoming);
    
    const storedInvites = JSON.parse(localStorage.getItem('cc_invites_' + user.id) || '{"received":[],"sent":[],"upcoming":[]}');
    setInvites(storedInvites);
  };

  const handleAuth = () => {
    setError('');
    if (!email.endsWith('@torontomu.ca')) {
      setError('Please use your TMU email');
      return;
    }
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
    setPage('app');
  };

  const handleSendRequest = (userId) => {
    const newOutgoing = [...pendingOutgoing, userId];
    setPendingOutgoing(newOutgoing);
    localStorage.setItem('cc_pending_outgoing_' + user.id, JSON.stringify(newOutgoing));
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
      !pendingOutgoing.includes(u.id)
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
  };
  // AUTH PAGE
  if (page === 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Welcome to Campus Connect!
            </h1>
            <p className="text-gray-600 text-lg">Meet TMU students on campus, right now.</p>
          </div>

          {!awaitingVerification ? (
            <div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your TMU Email</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="firstname.lastname"
                    value={email.replace('@torontomu.ca', '')}
                    onChange={(e) => setEmail(e.target.value + '@torontomu.ca')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <div className="absolute right-4 top-3 text-sm text-gray-400">@torontomu.ca</div>
                </div>
              </div>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <button
                onClick={handleAuth}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition transform hover:scale-105"
              >
                Get Started →
              </button>
              <p className="text-xs text-gray-500 text-center mt-4">
                TMU students only • Quick 2-minute setup
              </p>
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
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Almost there!</h2>
          <p className="text-gray-600 mb-6">Tell us a bit about yourself</p>
          
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
                {profile.photoUrl ? 'Change Photo' : 'Upload Photo'}
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
          
          <input
            type="text"
            placeholder="Program (e.g., Computer Science)"
            value={profile.program}
            onChange={(e) => setProfile({...profile, program: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500"
          />
          
          <select
            value={profile.gender}
            onChange={(e) => setProfile({...profile, gender: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-6 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-binary">Non-binary</option>
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
// MAIN APP - RENDER FUNCTIONS
  const renderDashboard = () => (
    <div>
      <div className="flex gap-4 mb-4 border-b overflow-x-auto">
        <button
          onClick={() => setDashboardTab('oncampus')}
          className={'pb-3 px-2 font-medium transition whitespace-nowrap ' + (dashboardTab === 'oncampus' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600')}
        >
          On Campus ({getOnCampusConnections().length})
        </button>
        <button
          onClick={() => setDashboardTab('all')}
          className={'pb-3 px-2 font-medium transition whitespace-nowrap ' + (dashboardTab === 'all' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600')}
        >
          All ({getConnections().length})
        </button>
        <button
          onClick={() => setDashboardTab('discover')}
          className={'pb-3 px-2 font-medium transition whitespace-nowrap ' + (dashboardTab === 'discover' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600')}
        >
          Discover
        </button>
      </div>

      {dashboardTab === 'oncampus' && (
        <div className="space-y-3">
          {selectedPeople.length > 0 && (
            <button
              onClick={openInviteModal}
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send Invite to {selectedPeople.length} {selectedPeople.length === 1 ? 'person' : 'people'}
            </button>
          )}
          
          {getOnCampusConnections().length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No connections on campus right now</p>
            </div>
          ) : (
            getOnCampusConnections().map(person => (
              <div key={person.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
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
                    <div className="text-sm text-green-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      On Campus
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {dashboardTab === 'all' && (
        <div className="space-y-3">
          {getAllConnections().map(person => (
            <div 
              key={person.id} 
              onClick={() => setSelectedUserProfile(person)}
              className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                {getInitials(person.name)}
              </div>
              <div>
                <div className="font-semibold text-gray-800">{person.name}</div>
                <div className="text-sm text-gray-600">@{person.username}</div>
                <div className={'text-sm flex items-center gap-1 mt-1 ' + (person.isOnCampus ? 'text-green-600' : 'text-gray-500')}>
                  <MapPin className="w-4 h-4" />
                  {person.isOnCampus ? 'On Campus' : 'Off Campus'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {dashboardTab === 'discover' && (
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
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-1"
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

  const renderFriends = () => (
    <div>
      <div className="flex gap-4 mb-4 border-b overflow-x-auto">
        <button
          onClick={() => setFriendsTab('connections')}
          className={'pb-3 px-2 font-medium transition whitespace-nowrap ' + (friendsTab === 'connections' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600')}
        >
          Connections ({myConnections.length})
        </button>
        <button
          onClick={() => setFriendsTab('requests')}
          className={'pb-3 px-2 font-medium transition whitespace-nowrap ' + (friendsTab === 'requests' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600')}
        >
          Requests ({pendingIncoming.length})
        </button>
        <button
          onClick={() => setFriendsTab('pending')}
          className={'pb-3 px-2 font-medium transition whitespace-nowrap ' + (friendsTab === 'pending' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600')}
        >
          Pending ({pendingOutgoing.length})
        </button>
        <button
          onClick={() => setFriendsTab('invites')}
          className={'pb-3 px-2 font-medium transition whitespace-nowrap ' + (friendsTab === 'invites' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600')}
        >
          Invites ({invites.received.length})
        </button>
      </div>

      {friendsTab === 'connections' && (
        <div className="space-y-3">
          {myConnections.map(userId => {
            const person = getUserById(userId);
            if (!person) return null;
            return (
              <div key={userId} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
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
                    <div className="text-sm text-gray-500 mt-1">✓ Connected</div>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoveConnection(userId)}
                  className="text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 transition"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}

      {friendsTab === 'requests' && (
        <div className="space-y-3">
          {pendingIncoming.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <p className="text-gray-600">No pending requests</p>
            </div>
          ) : (
            pendingIncoming.map(userId => {
              const person = getUserById(userId);
              if (!person) return null;
              return (
                <div key={userId} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
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
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleDeclineRequest(userId)}
                      className="text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {friendsTab === 'pending' && (
        <div className="space-y-3">
          {pendingOutgoing.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <p className="text-gray-600">No pending requests</p>
            </div>
          ) : (
            pendingOutgoing.map(userId => {
              const person = getUserById(userId);
              if (!person) return null;
              return (
                <div key={userId} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
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
                      <div className="text-sm text-yellow-600 mt-1">⏳ Pending</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {friendsTab === 'invites' && (
        <div>
          <div className="flex gap-4 mb-4 border-b">
            <button
              onClick={() => setInvitesTab('received')}
              className={'pb-3 px-2 font-medium transition ' + (invitesTab === 'received' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600')}
            >
              Received ({invites.received.length})
            </button>
            <button
              onClick={() => setInvitesTab('sent')}
              className={'pb-3 px-2 font-medium transition ' + (invitesTab === 'sent' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600')}
            >
              Sent ({invites.sent.length})
            </button>
            <button
              onClick={() => setInvitesTab('upcoming')}
              className={'pb-3 px-2 font-medium transition ' + (invitesTab === 'upcoming' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600')}
            >
              Upcoming ({invites.upcoming.length})
            </button>
          </div>

          {invitesTab === 'received' && (
            <div className="space-y-3">
              {invites.received.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center">
                  <p className="text-gray-600">No pending invites</p>
                </div>
              ) : (
                invites.received.map(invite => {
                  const person = getUserById(invite.from);
                  return (
                    <div key={invite.id} className="bg-white rounded-xl shadow-sm p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm">
                          {getInitials(person?.name || 'U')}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{person?.name}</div>
                          <div className="text-sm text-gray-600">wants to {invite.activity.toLowerCase()}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        <div>📍 {invite.location}</div>
                        <div className="text-gray-500 mt-1">Just now</div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleInviteResponse(invite.id, 'accepted')}
                          className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleInviteResponse(invite.id, 'declined')}
                          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {invitesTab === 'sent' && (
            <div className="space-y-3">
              {invites.sent.map(invite => {
                const person = getUserById(invite.to);
                return (
                  <div key={invite.id} className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm">
                          {getInitials(person?.name || 'U')}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">You → {person?.name}</div>
                          <div className="text-sm text-gray-600">{invite.activity} • {invite.location}</div>
                        </div>
                      </div>
                      <div className="text-sm text-yellow-600">⏳ Pending</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {invitesTab === 'upcoming' && (
            <div className="space-y-3">
              {invites.upcoming.map(invite => {
                const person = getUserById(invite.from === user.id ? invite.to : invite.from);
                return (
                  <div key={invite.id} className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm">
                        {getInitials(person?.name || 'U')}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{invite.activity} with {person?.name}</div>
                        <div className="text-sm text-gray-600">📍 {invite.location}</div>
                      </div>
                    </div>
                    <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
                      I'm Here
                    </button>
                  </div>
                );
              })}
            </div>
          )}
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
            <div className="text-sm text-gray-600">Connections</div>
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
        {currentTab === 'dashboard' && (
          <button
            onClick={toggleCampusMode}
            className="w-full bg-white rounded-xl shadow-sm p-6 mb-4 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={'w-16 h-16 rounded-full flex items-center justify-center ' + (isOnCampus ? 'bg-green-100' : campusMode === 'manual' ? 'bg-gray-100' : 'bg-gray-100')}>
                  <MapPin className={'w-8 h-8 ' + (isOnCampus ? 'text-green-600' : 'text-gray-600')} />
                </div>
                <div className="text-left">
                  <h3 className={'text-xl font-bold ' + (isOnCampus ? 'text-green-600' : 'text-gray-800')}>
                    {isOnCampus ? 'On TMU Campus' : campusMode === 'manual' ? 'Off Campus' : 'Off Campus'}
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

        {currentTab === 'dashboard' && renderDashboard()}
        {currentTab === 'friends' && renderFriends()}
        {currentTab === 'profile' && renderProfile()}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-around">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={'flex flex-col items-center gap-1 ' + (currentTab === 'dashboard' ? 'text-blue-500' : 'text-gray-600')}
          >
            <Users className="w-6 h-6" />
            <span className="text-xs font-medium">Dashboard</span>
          </button>
          <button
            onClick={() => setCurrentTab('friends')}
            className={'flex flex-col items-center gap-1 ' + (currentTab === 'friends' ? 'text-blue-500' : 'text-gray-600')}
          >
            <UserPlus className="w-6 h-6" />
            <span className="text-xs font-medium">Friends</span>
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
                    Remove Connection
                  </button>
                </>
              ) : pendingOutgoing.includes(selectedUserProfile.id) ? (
                <button
                  disabled
                  className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-semibold cursor-not-allowed"
                >
                  Request Pending
                </button>
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
                  Send Connection Request
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
