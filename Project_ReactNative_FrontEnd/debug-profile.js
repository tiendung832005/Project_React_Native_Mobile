// Debug Profile Data Issue
// Run this script to understand what's happening with profile data

console.log("🔍 Starting Profile Debug Analysis...\n");

// Simulate the current issue
const mockScenarios = {
  register: {
    username: "dung123",
    email: "dung123@gmail.com",
    password: "password123",
    // This gets saved to database with proper ID
    databaseRecord: {
      id: 1, // Auto-generated DB ID
      username: "dung123",
      email: "dung123@gmail.com",
      bio: "Hello world!",
      name: "Dung Nguyen",
      created_at: "2025-11-07T10:00:00Z",
    },
  },

  login: {
    email: "dung123@gmail.com",
    password: "password123",
    // Backend creates JWT token
    jwtPayload: {
      userId: "dung123@gmail.com", // ❌ Uses EMAIL instead of ID
      exp: "2025-11-08T07:37:30.000Z",
      iat: "2025-11-07T07:37:30.000Z",
    },
  },

  profileRequest: {
    endpoint: "/users/me",
    headers: {
      Authorization: "Bearer jwt_token_here",
    },
    // Backend tries to find user
    backendLogic: {
      extractedUserId: "dung123@gmail.com", // From JWT
      sqlQuery: "SELECT * FROM users WHERE id = ?", // ❌ Searches by ID
      queryParams: ["dung123@gmail.com"], // ❌ String email in ID field
      result: null, // ❌ No user found because ID is numeric but searching with email
    },
  },
};

console.log("📋 Issue Analysis:");
console.log("==================");

console.log("\n✅ Register Phase:");
console.log("- Username:", mockScenarios.register.username);
console.log("- Email:", mockScenarios.register.email);
console.log("- Database ID:", mockScenarios.register.databaseRecord.id);
console.log("- Status: SUCCESS - User created in database");

console.log("\n🔑 Login Phase:");
console.log("- Login Email:", mockScenarios.login.email);
console.log("- JWT userId:", mockScenarios.login.jwtPayload.userId);
console.log("- Issue: JWT uses EMAIL as userId instead of database ID");

console.log("\n❌ Profile Request Phase:");
console.log("- Endpoint:", mockScenarios.profileRequest.endpoint);
console.log(
  "- JWT userId extracted:",
  mockScenarios.profileRequest.backendLogic.extractedUserId
);
console.log("- SQL Query:", mockScenarios.profileRequest.backendLogic.sqlQuery);
console.log(
  "- Query Param:",
  mockScenarios.profileRequest.backendLogic.queryParams[0]
);
console.log("- Result: 404 User not found (searching email in ID field)");

console.log("\n🔧 Root Cause:");
console.log("===============");
console.log("1. Database stores user with ID = 1");
console.log('2. JWT token stores userId = "dung123@gmail.com"');
console.log('3. /users/me endpoint searches WHERE id = "dung123@gmail.com"');
console.log("4. No match found → 404 error");

console.log("\n💡 Solutions:");
console.log("=============");

console.log("\n🎯 Backend Fix (Recommended):");
console.log("Option 1: Fix JWT creation");
console.log("```java");
console.log("// Instead of:");
console.log('.claim("userId", user.getEmail())');
console.log("");
console.log("// Use:");
console.log('.claim("userId", user.getId())');
console.log('.claim("email", user.getEmail())');
console.log("```");

console.log("\nOption 2: Fix /users/me endpoint");
console.log("```java");
console.log("// Instead of:");
console.log("User user = userRepository.findById(userId);");
console.log("");
console.log("// Use:");
console.log('User user = userId.contains("@") ? ');
console.log("    userRepository.findByEmail(userId) : ");
console.log("    userRepository.findById(Long.parseLong(userId));");
console.log("```");

console.log("\n✅ Frontend Workaround (Already Implemented):");
console.log('- Detect 404 "User not found" error');
console.log("- Extract user data from JWT token");
console.log("- Create profile object with correct info");
console.log("- Display proper username instead of fallback data");

console.log("\n🚀 Test Results Expected:");
console.log("=========================");
console.log("After implementing workaround:");
console.log('- Profile screen shows: "dung123" (correct)');
console.log('- Email shows: "dung123@gmail.com" (correct)');
console.log('- Bio shows: "Profile created from login token"');
console.log('- No more "usủettt" or wrong user data');

console.log("\n📱 Next Steps:");
console.log("==============");
console.log('1. Test profile screen now - should show correct "dung123"');
console.log("2. Backend team should implement one of the fixes above");
console.log("3. Remove frontend workaround after backend fix");

console.log("\n✨ Debug Complete!");
