import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { UserData } from '../../context/UserContext';
import { CourseData } from '../../context/CourseContext';
import { server } from '../../config';
import axios from 'axios';
import toast from 'react-hot-toast';

const PaymentSuccess = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchUser, setIsAuth } = UserData();
  const { fetchCourses, fetchMyCourse } = CourseData();
  const messageShownRef = useRef(false);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem("token");
        console.log("Token found:", !!token); // Debug log
        
        if (!token) {
          // If no token, try to get it from sessionStorage
          const sessionToken = sessionStorage.getItem("token");
          if (sessionToken) {
            localStorage.setItem("token", sessionToken);
          } else {
            throw new Error("No authentication token found");
          }
        }

        // Extract parameters from URL
        const searchParams = new URLSearchParams(location.search);
        const tx_ref = searchParams.get('tx_ref') || searchParams.get('trx_ref');
        const status = searchParams.get('status');
    
        console.log("URL Parameters:", {
          tx_ref,
          status,
          search: location.search
        });
    
        if (!tx_ref) {
          throw new Error("No transaction reference found");
        }

        // Check if success message has already been shown for this transaction
        const messageKey = `payment_success_${tx_ref}`;
        const messageShown = sessionStorage.getItem(messageKey);
        
        if (messageShown === 'true' || messageShownRef.current) {
          console.log("Success message already shown for this transaction");
          navigate('/dashboard');
          return;
        }

        // Only proceed with verification if we have a transaction reference
        console.log("Verifying payment with tx_ref:", tx_ref); // Debug log
    
        const response = await axios.post(
          `${server}/api/payment/verify-enroll`,
          { tx_ref },
          {
            headers: {
              "token": token,
              "Content-Type": "application/json"
            }
          }
        );
    
        console.log("Verification response:", response.data); // Debug log
    
        if (response.data.success) {
          // Refresh user data and set auth state
          await fetchUser();
          setIsAuth(true);
          await fetchCourses();
          await fetchMyCourse();
          
          // Show success message and mark it as shown
          if (!messageShownRef.current) {
            toast.success(response.data.message || "Payment verified successfully!");
            messageShownRef.current = true;
            sessionStorage.setItem(messageKey, 'true');
          }
          
          // Redirect to dashboard after successful verification
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          throw new Error(response.data.message || "Payment verification failed");
        }
        
      } catch (error) {
        console.error("Verification error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        let errorMessage = "Payment verification failed";
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
        navigate('/payment-error', {
          state: { error: errorMessage }
        });
      }
    };

    verifyPayment();
  }, [navigate, fetchUser, fetchCourses, fetchMyCourse, location.search, setIsAuth]);

  return (
    <div className="payment-success" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #f0fff0 0%, #ffffff 100%)'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '50px',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
        maxWidth: '450px',
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
        }} />
        
        <div style={{
          color: '#22c55e',
          fontSize: '64px',
          marginBottom: '25px',
          animation: 'scaleIn 0.5s ease-out',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#f0fff0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 4px 15px rgba(34, 197, 94, 0.2)'
          }}>
            ✓
          </div>
        </div>

        <h2 style={{
          color: '#22c55e',
          fontSize: '28px',
          marginBottom: '15px',
          fontWeight: '600',
          animation: 'fadeIn 0.5s ease-out 0.3s both'
        }}>
          Payment Successful!
        </h2>

        <p style={{
          color: '#4b5563',
          fontSize: '16px',
          lineHeight: '1.6',
          marginBottom: '30px',
          animation: 'fadeIn 0.5s ease-out 0.5s both'
        }}>
          Verifying your payment...
        </p>

        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: '#f0fff0',
          borderRadius: '2px',
          overflow: 'hidden',
          marginTop: '20px'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#22c55e',
            animation: 'loading 2s ease-in-out infinite'
          }} />
        </div>
      </div>

      <style>
        {`
          @keyframes scaleIn {
            from {
              transform: scale(0);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes loading {
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}
      </style>
    </div>
  );
};

export default PaymentSuccess;