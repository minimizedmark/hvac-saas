import { NextResponse } from 'next/server';

// Edmonton coordinates for realistic positioning
const EDMONTON_CENTER = { lat: 53.5444, lng: -113.4909 };
const EDMONTON_BOUNDS = {
  north: 53.65,
  south: 53.45,
  east: -113.35,
  west: -113.65
};

interface TechData {
  name: string;
  status: 'en-route' | 'on-site' | 'available';
  customer: string | null;
  jobType: string;
  currentJob: string;
  eta: number | null;
  skills: string[];
}

interface TechState extends TechData {
  id: number;
  truck: string;
  phone: string;
  color: string;
  position: { lat: number; lng: number };
  route: { lat: number; lng: number }[];
}

// Helper to generate realistic Edmonton addresses
function generateEdmontonAddress(): string {
  const streets = [
    'Jasper Ave', 'Whyte Ave', 'Calgary Trail', 'Gateway Blvd', 'Stony Plain Rd',
    '104 St', '109 St', '82 Ave', '51 Ave', 'Groat Rd', 'Fort Rd', '118 Ave'
  ];
  const number = Math.floor(Math.random() * 20000) + 1000;
  const street = streets[Math.floor(Math.random() * streets.length)];
  return `${number} ${street}`;
}

// Call OSRM to get route between two points
async function getRouteFromOSRM(start: {lat: number, lng: number}, end: {lat: number, lng: number}) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.code === 'Ok' && data.routes && data.routes[0]) {
      const coordinates = data.routes[0].geometry.coordinates;
      // Convert from [lng, lat] to {lat, lng} and sample every ~5th point for smoother animation
      const route = coordinates
        .filter((_: any, idx: number) => idx % 5 === 0)
        .map((coord: number[]) => ({
          lat: coord[1],
          lng: coord[0]
        }));
      
      return route.length > 0 ? route : null;
    }
    
    return null;
  } catch (error) {
    console.error('OSRM routing error:', error);
    return null;
  }
}

// Generate a random position within Edmonton bounds
function randomEdmontonPosition() {
  return {
    lat: EDMONTON_BOUNDS.south + Math.random() * (EDMONTON_BOUNDS.north - EDMONTON_BOUNDS.south),
    lng: EDMONTON_BOUNDS.west + Math.random() * (EDMONTON_BOUNDS.east - EDMONTON_BOUNDS.west)
  };
}

// Call Grok API to generate realistic business state
async function generateBusinessStateWithGrok() {
  const grokApiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
  
  if (!grokApiKey) {
    console.warn('No Grok API key found, using fallback generation');
    return null;
  }

  try {
    const prompt = `You are generating a realistic snapshot of an HVAC business operating in Edmonton, Alberta on ${new Date().toLocaleDateString()}.

Generate data for 5 HVAC technicians with realistic:
- Names (diverse, realistic Canadian names)
- Current status (on-site, en-route, or available)
- Job types (emergency repairs, installations, maintenance, inspections)
- Customer names and types (residential, commercial)
- Time estimates if en-route

Make it feel like a real day in winter Edmonton HVAC work. Include typical winter issues like no heat emergencies, furnace problems, etc.

Return ONLY valid JSON in this exact format:
{
  "techs": [
    {
      "name": "Full Name",
      "status": "en-route" | "on-site" | "available",
      "customer": "Customer Name or Business" or null,
      "jobType": "Emergency - No Heat" or similar,
      "currentJob": "Brief location description",
      "eta": number or null,
      "skills": ["skill1", "skill2", "skill3"]
    }
  ]
}`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${grokApiKey}`
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          { role: 'system', content: 'You are a business simulation assistant. Return only valid JSON, no markdown or explanations.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      console.error('Grok API error:', response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) return null;

    // Strip markdown code blocks if present
    const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    
    return parsed.techs || null;
  } catch (error) {
    console.error('Grok generation error:', error);
    return null;
  }
}

// Fallback realistic generation without Grok
function generateFallbackBusinessState() {
  const names = [
    'Mike Rodriguez', 'Danny Chen', 'Steve Martinez', 'Carlos Diaz', 'James Wilson',
    'Sarah Thompson', 'Kevin Patel', 'Marcus Brown'
  ];
  
  const jobTypes = [
    'Emergency - No Heat', 'No Cooling - Emergency', 'Furnace Maintenance',
    'AC Installation', 'Commercial HVAC Service', 'Thermostat Upgrade',
    'Duct Cleaning', 'Heat Pump Repair', 'Quarterly Inspection'
  ];
  
  const customers = [
    'Downtown Office Tower', 'Residential Client', 'South Side Family',
    'West Edmonton Business', 'Northeast Home', 'Commercial Property',
    'Southgate Complex', 'Whyte Ave Restaurant'
  ];
  
  const statuses: ('en-route' | 'on-site' | 'available')[] = ['en-route', 'on-site', 'available'];
  
  const skills = ['Lennox', 'Carrier', 'Trane', 'York', 'Bryant', 'Rheem', 'Goodman', 'Commercial', 'Residential', 'Emergency'];
  
  return Array.from({ length: 5 }, (_, i) => ({
    name: names[i],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    customer: Math.random() > 0.2 ? customers[Math.floor(Math.random() * customers.length)] : null,
    jobType: jobTypes[Math.floor(Math.random() * jobTypes.length)],
    currentJob: Math.random() > 0.2 ? generateEdmontonAddress() : 'Shop - Available',
    eta: Math.random() > 0.5 ? Math.floor(Math.random() * 25) + 5 : null,
    skills: Array.from({ length: 3 }, () => skills[Math.floor(Math.random() * skills.length)])
  }));
}

export async function GET() {
  try {
    // Try Grok first, fall back to local generation
    let techsData = await generateBusinessStateWithGrok();
    
    if (!techsData || !Array.isArray(techsData) || techsData.length === 0) {
      console.log('Using fallback generation');
      techsData = generateFallbackBusinessState();
    }

    // Assign colors and IDs
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
    
    // Build full tech state with routes
    const techStates: TechState[] = await Promise.all(
      techsData.slice(0, 5).map(async (tech: TechData, idx: number) => {
        const color = colors[idx];
        const phone = `(780) 555-0${100 + idx * 20}`;
        
        // Generate position and route
        let position = randomEdmontonPosition();
        let route: { lat: number; lng: number }[] = [];
        
        if (tech.status === 'en-route') {
          // Generate start and end points
          const start = randomEdmontonPosition();
          const end = randomEdmontonPosition();
          
          // Get real street route from OSRM
          const osrmRoute = await getRouteFromOSRM(start, end);
          
          if (osrmRoute && osrmRoute.length > 5) {
            route = osrmRoute;
            // Start at beginning of route
            const progress = Math.random() * 0.4; // 0-40% along route
            const index = Math.floor(route.length * progress);
            position = route[index];
          } else {
            // Fallback: generate simple route
            route = Array.from({ length: 15 }, (_, i) => ({
              lat: start.lat + (end.lat - start.lat) * (i / 14),
              lng: start.lng + (end.lng - start.lng) * (i / 14)
            }));
            position = route[0];
          }
        }
        
        return {
          id: idx + 1,
          name: tech.name,
          truck: `Truck #${idx + 1}`,
          phone,
          status: tech.status,
          currentJob: tech.currentJob,
          customer: tech.customer,
          jobType: tech.jobType,
          eta: tech.status === 'en-route' ? tech.eta : null,
          skills: tech.skills,
          color,
          position,
          route
        };
      })
    );

    return NextResponse.json({
      techs: techStates,
      timestamp: new Date().toISOString(),
      mode: techsData ? 'grok' : 'fallback'
    });

  } catch (error) {
    console.error('Demo state generation error:', error);
    
    // Emergency fallback
    return NextResponse.json({
      error: 'Generation failed',
      techs: [],
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
