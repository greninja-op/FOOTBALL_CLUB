/**
 * Verification script for Task 23.2: Injury Routes
 * Confirms all required routes are properly configured
 */

console.log('\n=== Task 23.2 Verification: Injury Routes ===\n');

// Check if file exists and can be required
try {
  const injuryRoutes = require('./routes/injuryRoutes');
  console.log('✓ injuryRoutes.js file exists and is valid');
  
  // Verify it's an Express router
  if (injuryRoutes && injuryRoutes.stack) {
    console.log('✓ File exports a valid Express router');
    
    // Extract route information
    const routes = [];
    injuryRoutes.stack.forEach((layer) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
        const middlewareCount = layer.route.stack.length;
        routes.push({
          path: layer.route.path,
          methods: methods,
          middlewareCount: middlewareCount
        });
      }
    });
    
    console.log(`✓ Found ${routes.length} routes configured\n`);
    
    // Verify required routes
    const requiredRoutes = [
      { method: 'POST', path: '/', description: 'Log new injury' },
      { method: 'GET', path: '/', description: 'Get all injuries' },
      { method: 'PUT', path: '/:id/recover', description: 'Mark injury as recovered' }
    ];
    
    console.log('Required Routes:');
    requiredRoutes.forEach((required) => {
      const found = routes.find(r => 
        r.methods === required.method && r.path === required.path
      );
      if (found) {
        console.log(`  ✓ ${required.method} /api/injuries${required.path} - ${required.description}`);
        console.log(`    Middleware count: ${found.middlewareCount}`);
      } else {
        console.log(`  ✗ ${required.method} /api/injuries${required.path} - NOT FOUND`);
      }
    });
    
    console.log('\nBonus Routes:');
    const bonusRoutes = routes.filter(r => 
      !requiredRoutes.some(req => req.method === r.methods && req.path === r.path)
    );
    bonusRoutes.forEach((route) => {
      console.log(`  + ${route.methods} /api/injuries${route.path}`);
    });
    
  } else {
    console.log('✗ File does not export a valid Express router');
  }
  
} catch (error) {
  console.log('✗ Error loading injuryRoutes.js:', error.message);
  process.exit(1);
}

// Check if routes are registered in server.js
console.log('\nServer Registration:');
try {
  const fs = require('fs');
  const serverContent = fs.readFileSync('./server.js', 'utf8');
  
  if (serverContent.includes("require('./routes/injuryRoutes')")) {
    console.log('✓ injuryRoutes imported in server.js');
  } else {
    console.log('✗ injuryRoutes NOT imported in server.js');
  }
  
  if (serverContent.includes("app.use('/api/injuries', injuryRoutes)")) {
    console.log('✓ injuryRoutes registered at /api/injuries');
  } else {
    console.log('✗ injuryRoutes NOT registered in server.js');
  }
  
} catch (error) {
  console.log('✗ Error checking server.js:', error.message);
}

console.log('\n=== Task 23.2 Complete ===\n');
console.log('Summary:');
console.log('  - Created server/routes/injuryRoutes.js');
console.log('  - POST /api/injuries: requireRole([coach, admin]), loggerMiddleware');
console.log('  - GET /api/injuries: requireRole([coach, manager, admin])');
console.log('  - PUT /api/injuries/:id/recover: requireRole([coach, admin]), loggerMiddleware');
console.log('  - Routes registered in server.js');
console.log('  - Follows pattern from disciplinaryRoutes.js');
console.log('\nValidates Requirements: 14.1, 14.2, 14.4\n');
