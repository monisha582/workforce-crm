# Real-Time Integration Testing Guide

## 🔗 Socket.IO Real-Time Features

All new features are built with real-time capabilities in mind. This guide explains how to test and verify real-time functionality.

---

## ✅ Real-Time Capabilities Implemented

### 1. Task Real-Time Updates
**Event:** `task:updated`
**Trigger:** When any user updates a task status, assignee, or priority
**Test Steps:**
```
1. Open Tasks page in two browser windows (side by side)
2. In Window 1: Create a task and assign to yourself
3. In Window 2: Refresh and view the new task
4. In Window 1: Click on the task and change status
5. In Window 2: Status should update automatically without refresh
```

### 2. Leave Request Real-Time Updates
**Event:** `leave:requested`, `leave:approved`
**Trigger:** When leave is requested or approved
**Test Steps:**
```
1. Open Leaves page in two browser windows
2. In Window 1: Request a new leave
3. In Window 2: New leave should appear in list
4. (As HR) In second window: Approve the leave
5. In Window 1: Status should update to "APPROVED"
```

### 3. Attendance Real-Time Updates
**Event:** `attendance:checkedIn`, `attendance:checkedOut`
**Trigger:** When user checks in or checks out
**Test Steps:**
```
1. Open Attendance and Dashboard in different windows
2. Check in from Attendance page
3. Dashboard should show updated status immediately
4. Check out from Attendance page
5. Working hours should update in Dashboard chart
```

### 4. Project Milestone Updates
**Event:** Socket support ready (custom events)
**Test Steps:**
```
1. Open Projects page in two windows
2. In Window 1: Create project with milestones
3. In Window 2: View project details
4. In Window 1: Update milestone status
5. Verify changes reflect without full page reload
```

---

## 🧪 Testing Environment Setup

### Local Development Testing
```bash
# Terminal 1 - Backend
cd server
npm install
npm run dev

# Terminal 2 - Frontend
cd client
npm install
npm run dev

# Open http://localhost:5173 in two browser windows
```

### Railway Production Testing
```
Frontend: https://satisfied-freedom-production-aace.up.railway.app
Backend: https://satisfied-freedom-production-aace.up.railway.app/api
```

---

## 📊 Real-Time Testing Scenarios

### Scenario 1: Multi-User Task Assignment
**Purpose:** Verify real-time task updates across users
**Steps:**
```
1. Login as User A in Window 1
2. Login as User B in Window 2
3. User A creates task "Design Homepage" and assigns to User B
4. In Window 2 (User B): Task appears immediately
5. User B clicks task and updates status to "IN_PROGRESS"
6. In Window 1 (User A): Status updates in real-time
7. User A assigns task to User C (close Window 2)
8. Reopen Window 2 and login as User C: Task is now assigned
```

### Scenario 2: Leave Approval Workflow
**Purpose:** Verify real-time leave status updates
**Steps:**
```
1. User A (Window 1): Request leave for next week
2. HR User (Window 2): See leave request appear immediately
3. HR User (Window 2): Approve the leave
4. User A (Window 1): Status changes to "APPROVED" without refresh
5. User A (Window 1): View Dashboard and updated leave status
6. HR User (Window 2): Reject another leave with reason
7. User A (Window 1): See rejection reason in real-time
```

### Scenario 3: Attendance & Working Hours
**Purpose:** Verify real-time attendance tracking
**Steps:**
```
1. User A (Window 1): Open Attendance page
2. User A (Window 2): Open Dashboard
3. In Window 1: Click "Check In"
4. In Window 2: Dashboard shows updated status immediately
5. After 1 hour in Window 1: Click "Check Out"
6. In Window 2: Working hours calculated and displayed
7. Both windows show working hours in chart without refresh
```

### Scenario 4: Project Milestone Tracking
**Purpose:** Verify real-time project updates
**Steps:**
```
1. Project Lead (Window 1): Create project "Website Redesign"
2. Project Lead (Window 1): Add milestone "Design Phase - Due 2026-07-15"
3. Team Member (Window 2): View project
4. Project Lead (Window 1): Change milestone status to "IN_PROGRESS"
5. Team Member (Window 2): Status updates in real-time
6. Project Lead (Window 1): Mark milestone "COMPLETED"
7. Team Member (Window 2): Progress percentage updates automatically
```

---

## 🔍 Monitoring Real-Time Connections

### Browser Console Commands
```javascript
// Check Socket.IO connection status
import { getSocket } from './services/socketService.js'
const socket = getSocket()
console.log('Connected:', socket.connected)
console.log('Socket ID:', socket.id)

// Listen to all events (debug mode)
socket.onAny((eventName, ...args) => {
  console.log(`Event: ${eventName}`, args)
})

// Emit test event
socket.emit('test:ping', { message: 'Hello Server' })
```

### Network Tab Monitoring
1. Open DevTools → Network tab
2. Filter by "WS" (WebSocket)
3. Look for WebSocket connection to `/socket.io`
4. Check status: 101 Switching Protocols = Connected
5. Perform actions and watch for real-time events

### Console Logging
Check browser console for:
- `✓ Socket connected: [socket-id]`
- Event emissions and receipts
- Connection errors or timeouts
- Reconnection attempts

---

## ⚙️ Performance Testing

### Latency Measurement
```javascript
// Measure round-trip time
const start = Date.now()
socket.emit('ping', () => {
  const latency = Date.now() - start
  console.log(`Latency: ${latency}ms`)
})
```

### Load Testing
```
1. Keep WebSocket connection open
2. Perform rapid task status updates
3. Monitor browser memory usage
4. Check server CPU usage in Railway
5. Verify no connection drops under load
```

### Scalability Checklist
- [ ] Single user: Works smoothly
- [ ] 2-5 concurrent users: No lag
- [ ] 10+ concurrent users: Acceptable latency
- [ ] Different actions simultaneously: All sync correctly
- [ ] Network interruption: Auto-reconnects
- [ ] Long sessions (1+ hours): Stable connection

---

## 🚨 Troubleshooting Real-Time Issues

### Issue: Socket Connection Failed
**Diagnosis:**
```javascript
const socket = getSocket()
console.log(socket.connected) // Should be true
console.log(socket.disconnected) // Should be false
```

**Fix:**
1. Check CORS configuration on server
2. Verify frontend API URL matches backend
3. Check Railway logs for WebSocket errors
4. Verify JWT token is valid
5. Clear browser cache and reconnect

### Issue: Updates Not Appearing Immediately
**Diagnosis:**
```javascript
socket.onAny((eventName, ...args) => {
  console.log(`Received: ${eventName}`, args)
})
```

**Fix:**
1. Verify Socket.IO listeners are registered
2. Check event name spelling matches
3. Verify user has permission for action
4. Check browser WebSocket tab for incoming messages
5. Force page refresh as fallback

### Issue: Multiple Connections Opening
**Diagnosis:**
```javascript
console.log(socket.id) // Should be same ID in all windows
```

**Fix:**
1. Ensure `socketService.js` returns singleton
2. Check `getSocket()` only creates one connection
3. Verify `disconnectSocket()` called on logout
4. Check for multiple service imports

### Issue: Reconnection Loop
**Diagnosis:**
- Console shows repeated "Socket disconnected" messages
- Network tab shows WebSocket opening/closing repeatedly

**Fix:**
1. Check server is running
2. Verify no rate limiting on server
3. Check JWT token expiration
4. Increase reconnection delay in socketService
5. Check server logs for connection errors

---

## 📈 Real-Time Feature Rollout

### Phase 1: Testing (Current)
- [x] Socket.IO infrastructure ready
- [x] Event listeners defined
- [x] Test in development
- [x] Monitor in production

### Phase 2: Gradual Enable
- [ ] Enable for 25% of users
- [ ] Monitor error rates
- [ ] Gather performance metrics
- [ ] Scale to 50% of users

### Phase 3: Full Rollout
- [ ] Enable for 100% of users
- [ ] Continuous monitoring
- [ ] Optimization based on metrics
- [ ] Customer support training

---

## 🎯 Real-Time Testing Checklist

### Before Production Testing
- [x] Socket.IO configured on client
- [x] Socket.IO configured on server
- [x] CORS allows WebSocket connections
- [x] Event listeners registered
- [x] Error handling in place
- [x] Auto-reconnection working

### During Testing
- [ ] Test each real-time feature
- [ ] Monitor connection stability
- [ ] Check message delivery
- [ ] Verify latency is acceptable
- [ ] Test with 5+ concurrent users
- [ ] Simulate network interruptions
- [ ] Test with slow network (throttle)

### After Testing
- [ ] Document performance metrics
- [ ] Report any issues found
- [ ] Optimization recommendations
- [ ] User training materials
- [ ] Support documentation

---

## 📚 Code Examples

### Listening for Task Updates in Component
```javascript
import { useEffect } from 'react'
import { onTaskUpdated } from '../services/socketService'

export default function TaskList() {
  useEffect(() => {
    const unsubscribe = onTaskUpdated((updatedTask) => {
      console.log('Task updated:', updatedTask)
      // Update component state
      setTasks(prev => 
        prev.map(t => t.id === updatedTask.id ? updatedTask : t)
      )
    })
    
    return () => unsubscribe()
  }, [])
  
  return <div>{/* Render tasks */}</div>
}
```

### Emitting Task Status Change
```javascript
import { emitTaskUpdated } from '../services/socketService'

const handleStatusChange = async (taskId, newStatus) => {
  // Update via API
  await updateTaskStatus(taskId, newStatus)
  
  // Notify other users via WebSocket
  emitTaskUpdated(taskId, { status: newStatus })
}
```

---

## 📞 Support

For real-time testing support:
1. Check browser console for errors
2. Review network WebSocket tab
3. Check Railway logs for server errors
4. Test with different browsers
5. Test with mobile devices
6. Document issues with reproduction steps

---

**Last Updated:** 2026-06-27
**Status:** ✅ Ready for Real-Time Testing
**Environment:** Production (Railway) & Development (Local)
