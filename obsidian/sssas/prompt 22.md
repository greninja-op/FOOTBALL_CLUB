![[Pasted image 20260415124909.png]]
this is the current calender desgin isnt matching our ui desgin language.
and make sure that every calender in our whole ui follows this new desgin for calender 



also do the same for this thing as well
![[Pasted image 20260415125408.png]]



next problem is that these menu options at the top have a feature where the current shown menu option will be highlighted so remove it and then only keep the feature to which when ever we click or hover that highlight red color thing shows up and after the pointer is moved from that option that red disappears , impliment this problem across all other logins except for the home page 
![[Pasted image 20260417164737.png]]
and there is some problem with the alingment of the texts menu options like it should be center to the manager text and  the name of the club i mean there should be equal spacing between the start of the menu options and the end of the menu options 


next problem with cards edge as you can see there is a problem where this edge side of the card is not correct 
![[Pasted image 20260417165322.png]]
![[Pasted image 20260417165325.png]]
while it should really be looking like this :
![[Pasted image 20260417165428.png]]
which is the correct way make sure that every other cards in the system should follow this desgin and fix every other card having the above problem 


next problem is the image that i set from the admin panel it should change across these placecs ![[Pasted image 20260417173853.png]]
the transition place where the given logo should be shown in this transition like the half of the logo should be in right side then left side , when closed the full logo will be revealed 

then these are the other places where its not shown 
![[Pasted image 20260417174214.png]]
![[Pasted image 20260417174219.png]]![[Pasted image 20260417174221.png]]
then here in the login page there isnt a change at all like there is no image loading thing as other pages where there is a loading thing but the image is not loaded here nothing is shown 
make sure the image thing should be fixed across every pages like all logins as well 

next problem is this as you can see there is a lot o f blank space in the right side 
so make use of that space and fill it 

 ![[Pasted image 20260417175922.png]]
next thing for this page is this i thing we should give a edit button at the top right edge of this card and the form should be prefilled with all the details that are current there and the logo which we have currently using then the admin should click the edit to change some thing 

next problem is this system logs section 
![[Pasted image 20260417180450.png]]
![[Pasted image 20260417180512.png]]
as you can see its a big card and i thing i will become even bigger as the logins is added , pls make it a clean card this just feels bigger and very long it only need to show the last 5 or something logs only and same for the search part as well show the current days 5 people then as the admin needs he or she can search it out using the filter make sure to apply the calender desgin change to here as well

next problem 

![[Pasted image 20260417181202.png]]
![[Pasted image 20260417183222.png]]
 when creating user or player this is the problem the dropdown list is showing up like this and the text that suppose to show the position isnt showing up 
 same problem while selecting the role as well 
![[Pasted image 20260417181405.png]]

next problem as you can see in this image
![[Pasted image 20260417181538.png]]

there is manager selected as role but still there is shown an option to select the role 
make sure that when ever the manager or other role which will be coach selected the the position option should not be shown 

another crucial change 
there should be a change in the database as well when we cerate the user the  full name that they will give can also be used to login not only there email and make sure that even though they enter there name with uppercase or lowercase or mix the name while entered in the login page it should converted to lowercase incase if the user types in mixed or uppercase in the login page.thats for the login page , in case of the player , coach , manager name there name should be displayed full caps across the ui for player , coach , manager in the ui only ,the logins thing will be like what i said  


next probelm 
![[Pasted image 20260417183247.png]]
this card isnt matching with our desgin language make the corners as i said earlier and where is the option to change the full name and password  as well
also need to add a photo of the player as well there isnt an option for that and there should be auto crop feature for the photo that will be uploaded 


next problem is can you add some player logins i mean 24 players with random footballers name as well as password will be 12345678 for very login you will create okey only players ,dont add any famous player name pls and email id will be ("playername"@gmail.com)


next ui change will be this to the trophie cabenet admin section 
![[Pasted image 20260417192018.png]]
there will be features need to be added like photo of the trophie then name of the cup , managername , team leader , then which all players played in that match , the oppositie team name like our vs which team etc 

this is the current trophie cabinet :
![[Pasted image 20260417192715.png]]
so what you need to do is change this design to as per this details :
### 1. Data Requirements (What needs to be fetched)

To populate this specific card, your database query must return the following fields for a single trophy record:

- **Header Info:**
    
    - `Competition Name` (String) - e.g., "Premier League Champions"
        
    - `Season Identifier` (String) - e.g., "Season 2025/26"
        
- **Media:**
    
    - `Trophy Asset` (URL/Path) - High-resolution, transparent PNG of the trophy.
        
- **Metadata (The 4-Stat Grid):**
    
    - `Year` (Number/String) - e.g., 2026
        
    - `Manager` (String) - e.g., J. Guardiola
        
    - `Captain` (String) - e.g., Kevin De Bruyne
        
    - `Final Match/Result` (String) - e.g., 3-1 vs Man City
        
- **Related Entities (Players):**
    
    - An array of `Player Objects` involved in the campaign. Each object must contain:
        
        - `Player Name` (String)
            
        - `Avatar Image` (URL/Path)
            
- **Action Link:**
    
    - `Report ID / URL` - Where the "View Season Report" button should navigate.
        

---

### 2. Layout Structure (Top to Bottom)

The card follows a strict vertical hierarchy inside a fixed-width container:

1. **Outer Container:** A wrapper that holds the intense red glowing shadow.
    
2. **Inner Card:** The main dark-themed background panel with rounded corners.
    
3. **Title Block (Top):**
    
    - Primary text (Trophy Name) centered and bold.
        
    - Secondary text (Season) colored red, smaller, and positioned directly beneath the title.
        
4. **Hero Image (Center-Top):**
    
    - The trophy image taking up the largest vertical space, centered with a subtle drop shadow to make it pop against the background.
        
5. **Metadata Grid (Center-Bottom):**
    
    - A 2x2 grid layout.
        
    - Each of the four cells contains an icon on the left, and stacked text (Label on top, Value on bottom) on the right.
        
6. **Player Roster (Bottom section):**
    
    - A section header ("Players Involved") with a right arrow indicator.
        
    - A horizontal, scrollable row of circular player avatars with their names truncated beneath them.
        
7. **Call to Action (Footer):**
    
    - A full-width button spanning the bottom edge of the card.
        

---

### 3. Visual & Styling Specifications

To achieve that premium, "enterprise ERP" look:

- **Backgrounds:** The card uses a dark gradient (mimicking brushed metal or dark glass), not a flat solid color. The stat grid cells use a slightly lighter, translucent dark gray to stand out.
    
- **Glow Effect:** A heavy, blurred, solid red `box-shadow` is applied to the very outermost container to create the "spotlight" effect seen in the image.
    
- **Typography:**
    
    - Use a clean, modern sans-serif font (like Inter or Roboto).
        
    - Make heavy use of **UPPERCASE** text with slight `letter-spacing` (tracking) for headers, labels, and the main button to give it a structured, official feel.
        
    - Data values (like the manager's name or the year) should be standard casing but bolded.
        
- **Icons:** Use minimal, outline-style icons (Calendar, User, Star, MapPin) in the 2x2 grid to maintain a clean UI.

this should eventualy look like this :
![[Pasted image 20260417192904.png]]
so make the ui almost simialr to this and also make sure that the background should simialr to this image as well the main thing is while implemneting this should match our home page 