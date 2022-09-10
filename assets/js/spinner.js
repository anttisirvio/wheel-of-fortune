jQuery(document).ready( function($) {
    var d = new Date();

    let alreadySpinned = false;

    if (window.localStorage.getItem('lunch') && window.localStorage.getItem('lunch') !== 'undefined') {
        var storage = JSON.parse(window.localStorage.getItem('lunch'));
        var date1 = new Date(storage.date);
        var date2 = new Date(d.toLocaleDateString());

        if (date1.getTime() == date2.getTime()) {
            alreadySpinned = true;
            $('.result').html('Lounaspaikka tänään: <span style="color:'+storage.color+';">'+storage.place+'</span>');
        }
    }

    const sectors = [
        { color: "#1A1A1A", label: "Addis Ethiopian Kitchen" },
        { color: "#476055", label: "Ba Bu" },
        { color: "#f1c40f", label: "Bangkok 9" },
        { color: "#EECDA6", label: "Brokadi" },
        { color: "#8C2022", label: "Burgers & Wine" },
        { color: "#BB9465", label: "Capperi" },
        { color: "#F08E80", label: "Crazy Bing" },
        { color: "#2FA753", label: "Delhi Rasoi" },
        { color: "#F26754", label: "East Market" },
        { color: "#E94A2E", label: "Fafa's" },
        { color: "#000000", label: "Falafel Box" },
        { color: "#012F6B", label: "Fazer Cafe" },
        { color: "##ce9429", label: "Fredde's - Food & Fire" },
        { color: "#73AA4E", label: "Friends & Brgrs" },
        { color: "#E30613", label: "Hanko Sushi" },
        { color: "#ee343b", label: "Hesburger" },
        { color: "#133b5f", label: "Kalaliike & Bistro S. Wallin" },
        { color: "#00D800", label: "Limone Ravintola" },
        { color: "#212529", label: "Luckiefun's" },
        { color: "#c5aa6c", label: "Mari's Treehouse" },
        { color: "#2D9B87", label: "O'Learys" },
        { color: "#74CEDE", label: "Onam" },
        { color: "#A11211", label: "Pancho Villa" },
        { color: "#C90013", label: "Pizza Hut" },
        { color: "#FEA30B", label: "Pretty Boy Wingery" },
        { color: "#CAA051", label: "Ravintola Angelina" },
        { color: "#000000", label: "Ravintola Fame" },
        { color: "#51C2F0", label: "Sizzle Station" },
        { color: "#000", label: "Story" },
        { color: "#008D43", label: "Subway" },
        { color: "#CB2B30", label: "Teppanyaki" },
        { color: "#6F9800", label: "The Avocado Cafeteria" },
        { color: "#F79B2E", label: "TLB" },
        { color: "#878787", label: "Tokumaru" },
        { color: "#36A03F", label: "Tortilla House" }
    ];
    
    // Generate random float in range min-max:
    const rand = (m, M) => Math.random() * (M - m) + m;
    
    const tot = sectors.length;
    const elSpin = document.querySelector("#spin");
    const ctx = document.querySelector("#wheel").getContext`2d`;
    const dia = ctx.canvas.width;
    const rad = dia / 2;
    const PI = Math.PI;
    const TAU = 2 * PI;
    const arc = TAU / sectors.length;
    const friction = 0.991;  // 0.995=soft, 0.99=mid, 0.98=hard
    const angVelMin = 0.002; // Below that number will be treated as a stop
    let angVelMax = 0; // Random ang.vel. to acceletare to 
    let angVel = 0;    // Current angular velocity
    let ang = 0;       // Angle rotation in radians
    let isSpinning = false;
    let isAccelerating = false;
    
    //* Get index of current sector */
    const getIndex = () => Math.floor(tot - ang / TAU * tot) % tot;
    
    //* Draw sectors and prizes texts to canvas */
    const drawSector = (sector, i) => {
        const ang = arc * i;
        ctx.save();
        // COLOR
        ctx.beginPath();
        ctx.fillStyle = sector.color;
        ctx.moveTo(rad, rad);
        ctx.arc(rad, rad, rad, ang, ang + arc);
        ctx.lineTo(rad, rad);
        ctx.fill();
        // TEXT
        ctx.translate(rad, rad);
        ctx.rotate(ang + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#fff";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText(sector.label, rad - 10, 5);
        //
        ctx.restore();
    };
    
    //* CSS rotate CANVAS Element */
    const rotate = () => {
        const sector = sectors[getIndex()];
        ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
        elSpin.textContent = !angVel ? "PYÖRÄYTÄ" : sector.label;
        if (alreadySpinned) {
            elSpin.textContent = "Olet jo pyöräyttänyt tänään"
        }
        elSpin.style.background = sector.color;
    };
    
    const frame = () => {
        const sector = sectors[getIndex()];
        
        if (!isSpinning) return;
    
        if (angVel >= angVelMax) isAccelerating = false;
    
        // Accelerate
        if (isAccelerating) {
            angVel ||= angVelMin; // Initial velocity kick
            angVel *= 1.06; // Accelerate
        }
    
        // Decelerate
        else {
            isAccelerating = false;
            angVel *= friction; // Decelerate by friction  
    
            // SPIN END:
            if (angVel < angVelMin) {
                isSpinning = false;
                const lunch = {
                    date: d.toLocaleDateString(),
                    place: sector.label,
                    color: sector.color
                }
                window.localStorage.setItem('lunch', JSON.stringify(lunch));
                $('.result').html('Lounaspaikka tänään: <span style="color:'+sector.color+'">'+sector.label+'</span>');
                angVel = 0;
                alreadySpinned = true;
            }
        }
    
        ang += angVel; // Update angle
        ang %= TAU;    // Normalize angle
        rotate();      // CSS rotate!
    };
    
    const engine = () => {
        frame();
        requestAnimationFrame(engine)
    };
    
    elSpin.addEventListener("click", () => {
        if (alreadySpinned) return;
        if (isSpinning) return;
        isSpinning = true;
        isAccelerating = true;
        angVelMax = rand(0.25, 0.40);
    });
    
    // INIT!
    sectors.forEach(drawSector);
    rotate(); // Initial rotation
    engine(); // Start engine!
});