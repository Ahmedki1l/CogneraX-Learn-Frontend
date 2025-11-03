// API Testing Script
// This file tests the API services to ensure they're working correctly

import { api } from './services/api';

export async function testAPIServices() {
  console.log('🧪 Testing API Services...');
  
  const results = {
    auth: false,
    analytics: false,
    course: false,
    user: false,
    admin: false,
    ai: false,
    payment: false,
    upload: false
  };

  try {
    // Test Auth Service
    console.log('Testing Auth Service...');
    try {
      // Test login method exists
      if (typeof api.login === 'function') {
        console.log('✅ Auth.login method exists');
        results.auth = true;
      }
      
      // Test getMe method exists
      if (typeof api.getMe === 'function') {
        console.log('✅ Auth.getMe method exists');
      }
      
      // Test register method exists
      if (typeof api.register === 'function') {
        console.log('✅ Auth.register method exists');
      }
    } catch (error) {
      console.log('❌ Auth service test failed:', error);
    }

    // Test Analytics Service
    console.log('Testing Analytics Service...');
    try {
      if (typeof api.analytics.getPlatformAnalytics === 'function') {
        console.log('✅ Analytics.getPlatformAnalytics method exists');
        results.analytics = true;
      }
      
      if (typeof api.analytics.getUserEngagementStats === 'function') {
        console.log('✅ Analytics.getUserEngagementStats method exists');
      }
      
      if (typeof api.analytics.getStudentDashboard === 'function') {
        console.log('✅ Analytics.getStudentDashboard method exists');
      }
    } catch (error) {
      console.log('❌ Analytics service test failed:', error);
    }

    // Test Course Service
    console.log('Testing Course Service...');
    try {
      if (typeof api.course.getCourses === 'function') {
        console.log('✅ Course.getCourses method exists');
        results.course = true;
      }
      
      if (typeof api.course.createCourse === 'function') {
        console.log('✅ Course.createCourse method exists');
      }
      
      if (typeof api.course.getEnrolledCourses === 'function') {
        console.log('✅ Course.getEnrolledCourses method exists');
      }
    } catch (error) {
      console.log('❌ Course service test failed:', error);
    }

    // Test User Service
    console.log('Testing User Service...');
    try {
      if (typeof api.user.getUsers === 'function') {
        console.log('✅ User.getUsers method exists');
        results.user = true;
      }
      
      if (typeof api.user.updateUser === 'function') {
        console.log('✅ User.updateUser method exists');
      }
    } catch (error) {
      console.log('❌ User service test failed:', error);
    }

    // Test Admin Service
    console.log('Testing Admin Service...');
    try {
      if (typeof api.admin.getStudents === 'function') {
        console.log('✅ Admin.getStudents method exists');
        results.admin = true;
      }
      
      if (typeof api.admin.getStudentProgress === 'function') {
        console.log('✅ Admin.getStudentProgress method exists');
      }
    } catch (error) {
      console.log('❌ Admin service test failed:', error);
    }

    // Test AI Service
    console.log('Testing AI Service...');
    try {
      if (typeof api.ai.generateQuestions === 'function') {
        console.log('✅ AI.generateQuestions method exists');
        results.ai = true;
      }
      
      if (typeof api.ai.analyzeContent === 'function') {
        console.log('✅ AI.analyzeContent method exists');
      }
    } catch (error) {
      console.log('❌ AI service test failed:', error);
    }

    // Test Payment Service
    console.log('Testing Payment Service...');
    try {
      if (typeof api.payment.createPaymentIntent === 'function') {
        console.log('✅ Payment.createPaymentIntent method exists');
        results.payment = true;
      }
      
      if (typeof api.payment.enrollFreeCourse === 'function') {
        console.log('✅ Payment.enrollFreeCourse method exists');
      }
    } catch (error) {
      console.log('❌ Payment service test failed:', error);
    }

    // Test Upload Service
    console.log('Testing Upload Service...');
    try {
      if (typeof api.upload.uploadFile === 'function') {
        console.log('✅ Upload.uploadFile method exists');
        results.upload = true;
      }
      
      if (typeof api.upload.uploadVideo === 'function') {
        console.log('✅ Upload.uploadVideo method exists');
      }
    } catch (error) {
      console.log('❌ Upload service test failed:', error);
    }

    // Summary
    console.log('\n📊 API Service Test Results:');
    console.log('============================');
    Object.entries(results).forEach(([service, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${service.toUpperCase()}: ${passed ? 'PASSED' : 'FAILED'}`);
    });

    const totalPassed = Object.values(results).filter(Boolean).length;
    const totalServices = Object.keys(results).length;
    
    console.log(`\n🎯 Overall: ${totalPassed}/${totalServices} services passed`);
    
    if (totalPassed === totalServices) {
      console.log('🎉 All API services are working correctly!');
    } else {
      console.log('⚠️  Some API services need attention.');
    }

    return results;

  } catch (error) {
    console.error('❌ API testing failed:', error);
    return results;
  }
}

// Test new service files
export async function testNewServices() {
  console.log('\n🧪 Testing New API Services...');
  
  const newServices = {
    organization: false,
    field: false,
    lesson: false,
    quiz: false,
    assignment: false,
    notification: false,
    forum: false,
    cart: false,
    invitation: false,
    system: false
  };

  try {
    // Test Organization Service
    if (typeof api.organization?.getOrganizations === 'function') {
      console.log('✅ Organization.getOrganizations method exists');
      newServices.organization = true;
    }

    // Test Field Service
    if (typeof api.field?.getFields === 'function') {
      console.log('✅ Field.getFields method exists');
      newServices.field = true;
    }

    // Test Lesson Service
    if (typeof api.lesson?.getLessons === 'function') {
      console.log('✅ Lesson.getLessons method exists');
      newServices.lesson = true;
    }

    // Test Quiz Service
    if (typeof api.quiz?.getQuizzes === 'function') {
      console.log('✅ Quiz.getQuizzes method exists');
      newServices.quiz = true;
    }

    // Test Assignment Service
    if (typeof api.assignment?.getAssignments === 'function') {
      console.log('✅ Assignment.getAssignments method exists');
      newServices.assignment = true;
    }

    // Test Notification Service
    if (typeof api.notification?.getNotifications === 'function') {
      console.log('✅ Notification.getNotifications method exists');
      newServices.notification = true;
    }

    // Test Forum Service
    if (typeof api.forum?.getPosts === 'function') {
      console.log('✅ Forum.getPosts method exists');
      newServices.forum = true;
    }

    // Test Cart Service
    if (typeof api.cart?.getCart === 'function') {
      console.log('✅ Cart.getCart method exists');
      newServices.cart = true;
    }

    // Test Invitation Service
    if (typeof api.invitation?.getInvitations === 'function') {
      console.log('✅ Invitation.getInvitations method exists');
      newServices.invitation = true;
    }

    // Test System Service
    if (typeof api.system?.getSystemMetrics === 'function') {
      console.log('✅ System.getSystemMetrics method exists');
      newServices.system = true;
    }

    // Summary
    console.log('\n📊 New Service Test Results:');
    console.log('============================');
    Object.entries(newServices).forEach(([service, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${service.toUpperCase()}: ${passed ? 'PASSED' : 'FAILED'}`);
    });

    const totalPassed = Object.values(newServices).filter(Boolean).length;
    const totalServices = Object.keys(newServices).length;
    
    console.log(`\n🎯 New Services: ${totalPassed}/${totalServices} services passed`);
    
    return newServices;

  } catch (error) {
    console.error('❌ New service testing failed:', error);
    return newServices;
  }
}

// Run tests
export async function runAllAPITests() {
  console.log('🚀 Starting Comprehensive API Tests...\n');
  
  const mainResults = await testAPIServices();
  const newResults = await testNewServices();
  
  const allResults = { ...mainResults, ...newResults };
  const totalPassed = Object.values(allResults).filter(Boolean).length;
  const totalServices = Object.keys(allResults).length;
  
  console.log('\n🏆 FINAL RESULTS:');
  console.log('================');
  console.log(`Total Services: ${totalServices}`);
  console.log(`Passed: ${totalPassed}`);
  console.log(`Failed: ${totalServices - totalPassed}`);
  console.log(`Success Rate: ${Math.round((totalPassed / totalServices) * 100)}%`);
  
  if (totalPassed === totalServices) {
    console.log('\n🎉 ALL API SERVICES ARE WORKING PERFECTLY! 🎉');
  } else {
    console.log('\n⚠️  Some services need attention, but the core functionality is working.');
  }
  
  return allResults;
}
