import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../../api/config'
import {
  LayoutDashboard, Users, GraduationCap, DollarSign,
  BarChart2, UserPlus, LogOut, Menu, X, Bell, Eye, Trash2, Key, Copy, CheckCircle, Image, Newspaper, UserCircle
} from 'lucide-react'
