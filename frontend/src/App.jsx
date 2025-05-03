import 'bootstrap/dist/css/bootstrap.min.css';
import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import Header from "./components/header/Header";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Verify from "./pages/auth/Verify";
import Footer from "./components/footer/Footer";
import About from "./pages/about/About";
import Account from "./pages/account/Account";
import { UserData } from "./context/UserContext";
import Loading from "./components/Loading";
import Courses from "./pages/courses/Courses";
import CourseDescription from "./pages/coursedescription/CourseDescription";
import PaymentSuccess from "./pages/paymentsuccess/PaymentSuccess";
import Dashbord from "./pages/dashbord/Dashbord";
import CourseStudy from "./pages/coursestudy/CourseStudy";
import Lecture from "./pages/lecture/Lecture";
import AdminDashbord from "./admin/Dashboard/AdminDashbord";
import AdminCourses from "./admin/Courses/AdminCourses";
import AdminUsers from "./admin/Users/AdminUsers";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/resetpassword/ResetPassword";
import AddCourse from "./admin/Courses/AddCourse";
import CreateAssessment from "./pages/assessment/CreateAssessment";
import TakeAssessment from "./pages/assessment/TakeAssessment";
import ProtectedRoute from "./components/ProtectedRoute";
import Certificate from "./pages/certificate/Certificate";
import EditCourse from './admin/Courses/EditCourse';
import BlogPost from "./pages/blog/BlogPost";
import ManageBlog from "./admin/Blog/ManageBlog";
import ChatBox from "./components/ChatBox";
import BlogSection from "./components/blog/BlogSection";

const App = () => {
  const { isAuth, user, loading } = UserData();
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <BrowserRouter>
          <Header isAuth={isAuth} user={user} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/blog" element={<BlogSection />} />
            <Route
              path="/account"
              element={isAuth ? <Account user={user} /> : <Login />}
            />
            <Route path="/login" element={isAuth ? <Home /> : <Login />} />
            <Route
              path="/register"
              element={isAuth ? <Home /> : <Register />}
            />
            <Route path="/verify" element={isAuth ? <Home /> : <Verify />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route
              path="/course/:id"
              element={<CourseDescription user={user} />}
            />
            <Route
              path="/payment-success"
              element={<PaymentSuccess user={user} />}
            />
            <Route
              path="/dashboard"
              element={isAuth ? <Dashbord user={user} /> : <Login />}
            />
            <Route
              path="/course/study/:id"
              element={isAuth ? <CourseStudy user={user} /> : <Login />}
            />
            <Route
              path="/lectures/:id"
              element={isAuth ? <Lecture user={user} /> : <Login />}
            />
            <Route
              path="/admin/dashboard"
              element={
                isAuth && user?.role === "admin" ? (
                  <AdminDashbord />
                ) : (
                  <Home />
                )
              }
            />
            <Route
              path="/admin/courses"
              element={
                isAuth && user?.role === "admin" ? (
                  <AdminCourses />
                ) : (
                  <Home />
                )
              }
            />
            <Route
              path="/admin/users"
              element={
                isAuth && user?.role === "admin" ? (
                  <AdminUsers />
                ) : (
                  <Home />
                )
              }
            />
            <Route
              path="/admin/courses/add"
              element={
                isAuth && user?.role === "admin" ? (
                  <AddCourse />
                ) : (
                  <Home />
                )
              }
            />
            <Route
              path="/admin/courses/edit/:id"
              element={
                isAuth && user?.role === "admin" ? (
                  <EditCourse />
                ) : (
                  <Home />
                )
              }
            />
            <Route
              path="/admin/blog"
              element={
                isAuth && user?.role === "admin" ? (
                  <ManageBlog />
                ) : (
                  <Home />
                )
              }
            />
            <Route
              path="/assessment/create"
              element={
                <ProtectedRoute>
                  <CreateAssessment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessment/take/:id"
              element={
                <ProtectedRoute>
                  <TakeAssessment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificate/:id"
              element={
                <ProtectedRoute>
                  <Certificate />
                </ProtectedRoute>
              }
            />
            <Route path="/blog/:id" element={<BlogPost />} />
          </Routes>
          <Footer />
          {isAuth && <ChatBox isAdmin={user?.role === "admin"} />}
        </BrowserRouter>
      )}
    </>
  );
};

export default App;
