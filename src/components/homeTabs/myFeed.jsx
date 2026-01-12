import { ImageWithFallback } from "./figma/ImageWithFallback";
import { MapPin, Calendar, Users, Star, Clock, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  time: string;
  location: string;
  price: string;
  attendees: number;
  rating: number;
  category: string;
  organizer: string;
  isVerified: boolean;
}

interface ForYouPageProps {
  onEventClick?: (event: Event) => void;
}

export function ForYouPage({ onEventClick }: ForYouPageProps) {
  // Mock event data - would come from API based on user preferences
  const events: Event[] = [
  {
    "id": "1",
    "title": "ZAMBIAN ART AND DESIGN SHOW",
    "description": "Experience the finest Zambian art and design at CIELA. A showcase of local talent and creativity across various artistic disciplines.",
    "imageUrl": "/images/LSK event 1.png",
    "date": "Friday, Nov 21",
    "time": "All Day",
    "location": "CIELA",
    "price": "From K100",
    "attendees": 189,
    "rating": 4.6,
    "category": "Art",
    "organizer": "CIELA",
    "isVerified": true
  },
  {
    "id": "2",
    "title": "LUSAKA THRIFT MARKET & BLOCK PARTY",
    "description": "Join the thrift market and block party featuring special guest Samia the Great. Enjoy Zamrock music, shopping, and community vibes.",
    "imageUrl": "/images/lsk event 2.png",
    "date": "Saturday, TBA",
    "time": "All Day",
    "location": "NGAGRES MALL",
    "price": "K50",
    "attendees": 312,
    "rating": 4.4,
    "category": "Shopping",
    "organizer": "Sampa the Great",
    "isVerified": false
  },
  {
    "id": "3",
    "title": "15TH LUSAKA MOTOR SHOW",
    "description": "Zambia's biggest motor show featuring vehicles, tractor zone, earth moving equipment, green energy solutions, and financing options.",
    "imageUrl": "/images/lsk event3.png",
    "date": "Friday, Aug 29",
    "time": "All Day",
    "location": "LUSAKA POLO CLUB",
    "price": "100",
    "attendees": 567,
    "rating": 4.7,
    "category": "Automotive",
    "organizer": "Professional Insurance",
    "isVerified": true
  },
  {
    "id": "4",
    "title": "MAZABUKA AGRI EXPO",
    "description": "Agricultural exposition powered by Professional Insurance, featuring exhibitors including Zambian Commodity Exchange and industry partners.",
    "imageUrl": "/images/lsk event 4.png",
    "date": "Friday, Oct 10",
    "time": "All Day",
    "location": "MAZABUKA TURF CLUB",
    "price": "50",
    "attendees": 423,
    "rating": 4.5,
    "category": "Business",
    "organizer": "Professional Insurance",
    "isVerified": true
  },
  {
    "id": "5",
    "title": "CLASSIC CARS AUTO SHOW 2025",
    "description": "Classic car exhibition featuring exclusive market, car boot sale, full cash bar, music, food court, and wine tasting experience.",
    "imageUrl": "/images/LsK events 5.png",
    "date": "Sunday, Aug 24",
    "time": "9:30 AM onwards",
    "location": "TBA",
    "price": "50",
    "attendees": 278,
    "rating": 4.3,
    "category": "Automotive",
    "organizer": "Classic Cars Zambia",
    "isVerified": false
  },
  {
    "id": "6",
    "title": "EL MUKUKA'S ALBUM LAUNCH",
    "description": "Experience El Mukuka's album launch with live performance on grand piano plus band, followed by DJ after party with special guests.",
    "imageUrl": "/images/lsk event 6.png",
    "date": "Saturday, Dec 6",
    "time": "7:00 PM - 1:00 AM",
    "location": "TBA",
    "price": "200",
    "attendees": 156,
    "rating": 4.8,
    "category": "Music",
    "organizer": "Stella Artois",
    "isVerified": false
  },
  {
    "id": "7",
    "title": "Stories in the Woods",
    "description": "Interactive story experience for children ages 6 to 10 at Chirfwema Arboretum. A magical educational adventure in nature.",
    "imageUrl": "/images/lsk event6.png",
    "date": "Saturday, Nov 22",
    "time": "9:00 AM - 12:00 PM",
    "location": "Chirfwema Arboretum",
    "price": "500",
    "attendees": 89,
    "rating": 4.9,
    "category": "Education",
    "organizer": "Stories with Sala",
    "isVerified": true
  },
  {
    "id": "8",
    "title": "GREEN COSMOS - KEEP ZAMBIA CLEAN",
    "description": "Community clean-up initiative with special guest Simon Imme Walane. Join us in keeping Zambia clean and beautiful.",
    "imageUrl": "/images/green events.jpg",
    "date": "Friday, Nov 7",
    "time": "All Day",
    "location": "Kaunda Square Stage 1 Market",
    "price": "Free",
    "attendees": 234,
    "rating": 4.7,
    "category": "Community",
    "organizer": "Green Cosmos Zambia",
    "isVerified": true
  },
  {
    "id": "9",
    "title": "RENPOWER ZAMBIA 2025",
    "description": "3rd edition energy conference focusing on unlocking access to green energy generation and accelerating grid stability.",
    "imageUrl": "/images/green events2.jpg",
    "date": "Friday, Jul 11",
    "time": "All Day",
    "location": "Lusaka, Zambia",
    "price": "TBA",
    "attendees": 345,
    "rating": 4.6,
    "category": "Business",
    "organizer": "Euroconvention Global",
    "isVerified": true
  },
  {
    "id": "10",
    "title": "YOUTH CONNEKT ZAMBIA - GREEN HUSTLE",
    "description": "Youth entrepreneurship and innovation in agriculture event organized by Ministry of Youth, Sport & Arts and United Nations Zambia.",
    "imageUrl": "/images/green events3.jpg",
    "date": "Monday, Nov 17",
    "time": "All Day",
    "location": "New Government Complex, Lusaka",
    "price": "Free",
    "attendees": 512,
    "rating": 4.5,
    "category": "Business",
    "organizer": "Ministry of Youth, Sport & Arts",
    "isVerified": true
  },
  {
    "id": "11",
    "title": "BOUNCE ZAMBIA",
    "description": "The ultimate trampoline park experience in Lusaka. Enjoy wall-to-wall trampolines, dodgeball, foam pits, and more for all ages.",
    "imageUrl": "/images/bounce.PNG",
    "date": "",
    "time": "All Day",
    "location": "Garden City Mall, Lusaka",
    "price": "150",
    "attendees": 300,
    "rating": 4.9,
    "category": "Recreation",
    "organizer": "Bounce Zambia",
    "isVerified": false
  }


]

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-xl">Events picked for you</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Based on your interests and activity
        </p>
      </div>

      {/* Event Cards */}
      <div className="space-y-6 px-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onEventClick?.(event)}
          >
            {/* Event Image - bigger, with title/category/location overlaid */}
            <div className="relative w-full h-60 overflow-hidden">
              <ImageWithFallback
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />

              {/* Dark gradient to improve overlay text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Verified badge */}
              {event.isVerified && (
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full p-1.5">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              )}

              {/* Compact location pill - top-left */}
              <div className="absolute top-3 left-3">
                <div className="bg-black/60 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1 backdrop-blur-sm">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate max-w-[140px] text-xs">{event.location}</span>
                </div>
              </div>

              {/* Category, Title and Rating - bottom overlay */}
              <div className="absolute left-4 right-4 bottom-4 flex items-end justify-between gap-3">
                <div className="flex flex-col">
                  <Badge className="bg-white/90 text-foreground border-0 mb-2 px-2 py-1 text-xs">
                    {event.category}
                  </Badge>
                  <h3 className="text-white font-semibold leading-tight line-clamp-2 text-base drop-shadow-lg">
                    {event.title}
                  </h3>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="bg-black/70 text-white px-2 py-1 rounded-md text-sm flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{event.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Content - compressed so overall card is shorter */}
            <div className="p-3">
              {/* Condensed date/time + price row */}
              <div className="flex items-center justify-between gap-3 text-sm mb-2">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{event.time}</span>
                  </div>
                </div>

                <div className="text-sm font-medium">ZMW {event.price}</div>
              </div>

              {/* Organizer / attendees - single compact row */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div>By {event.organizer}</div>
                <div>{event.attendees} going</div>
              </div>

              {/* CTA */}
              <Button className="w-full mt-3 py-2 text-sm">
                Get Tickets
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
