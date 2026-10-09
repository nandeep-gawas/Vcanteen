import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BreakSlots from './pages/BreakSlots';
import GateScanner from './pages/GateScanner';
import Complaints from './pages/Complaints';
import Reviews from './pages/Reviews';
import ClassroomDelivery from './pages/ClassroomDelivery';
import PreBooking from './pages/PreBooking';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

export default function App() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Dashboard Shell */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* FEATURE: Year-Wise Break Slots & Timetable */}
      <Route
        path="/break-slots"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <BreakSlots />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* FEATURE: Turnstile QR Gate Scanner (Staff & Admin) */}
      <Route
        path="/entry-counter"
        element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <DashboardLayout>
              <GateScanner />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* FEATURE: Complaints System & Ticket Tracker */}
      <Route
        path="/complaints"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Complaints />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* FEATURE: Reviews, Suggestions & Recharts Analytics */}
      <Route
        path="/reviews"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Reviews />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* FEATURE: Classroom Food Delivery & OTP */}
      <Route
        path="/classroom-delivery"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ClassroomDelivery />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* FEATURE: Party & Birthday Pre-Booking */}
      <Route
        path="/pre-booking"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PreBooking />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Landing Page */}
      <Route path="/" element={<Landing />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
