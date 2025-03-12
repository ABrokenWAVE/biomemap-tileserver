import * as leaflet from "https://unpkg.com/leaflet/dist/leaflet-src.esm.js";
//import * as structures from "./structures"

const origin = window.location.origin

class MousePositionControl extends leaflet.Control {
    element: HTMLElement;

    constructor() {
        super({ position: "bottomleft" });
    }

    onAdd(map: leaflet.Map): HTMLElement {
        var latlng = leaflet.DomUtil.create("div", 'mouseposition leaflet-control-attribution');
        this.element = latlng;
        return latlng;
    }

    update(latlng: leaflet.LatLng, zoom: number) {
        this.element.innerHTML = `x: ${Math.round(latlng.lng)} z: ${Math.round(latlng.lat)} zoom: ${zoom}`;
    }
}


let base_layer = leaflet.tileLayer(`${origin}/biomemap/{z}/{x}/{y}.png`, {
    minNativeZoom: -8,
    maxZoom: 17,
    minZoom: -10,
});

let shaded_base_layer = leaflet.tileLayer(`${origin}/biomemap_shaded/{z}/{x}/{y}.png`, {
    minNativeZoom: -8,
    maxZoom: 17,
    minZoom: -10,
});

let contour_layer = leaflet.tileLayer(`${origin}/contours/{z}/{x}/{y}.png`, {
    minNativeZoom: -8,
    maxZoom: 17,
    minZoom: -10,
});

let base_maps = {
    "Normal": base_layer,
    "Shaded": shaded_base_layer,
};

let overlays = {
    "contours": contour_layer,
};

let map = leaflet.map('map', {
    crs: leaflet.CRS.Simple,
    layers: [base_layer]
}).setView([0.0, 0.0], 0);

let layer_control = leaflet.control.layers(base_maps, overlays).addTo(map);

let mousePosControl = new MousePositionControl;
map.addControl(mousePosControl);

map.on("mousemove", (e) => {
    let zoom = map.getZoom();
    mousePosControl.update(e.latlng, zoom);
});


export class StructureGrid extends leaflet.GridLayer {
    size: number;
    structurename: string;
    map: leaflet.Map;
    constructor(structure: string, spacing: number, map: leaflet.Map) {
        super({minZoom: -4, maxNativeZoom: 0, minNativeZoom: 0, zIndex: 4, tileSize: spacing*16});
        this.size=spacing*16;
        this.structurename=structure;
        this.map=map
        this.on('tileunload', function (event){
            let tile = event.tile as any;
            if ('linkedMarker' in tile) {
                map.removeLayer(tile.linkedMarker);
            }
        })
        this.on('tileload', function (event){
            let tile = event.tile as any;
            if ('linkedMarker' in tile) {
                map.addLayer(tile.linkedMarker);
            }
        })
    }
    createTile(coords: leaflet.Coords, done: leaflet.DoneCallback): any {
            var tile: any = document.createElement('div');
            var error;
            let url = `/structure_gen/${this.structurename}/${coords.x}/${coords.y}`

            fetch(url).then(x => x.json())
            .then(structure=>{
                if('exists' in structure){
                let marker = new StructureMarker(structure.x,structure.z,this.structurename);
                tile.linkedMarker = marker
                }
                done(error, tile);
            })

            //Debug Rendering
            //tile.style.outline = '1px solid green';
            //tile.style.backgroundColor = 'yellow';
            //Always return the tile.
            return tile;
    }
}
export class StructureHTMLElement extends HTMLDivElement{
    linkedMarker: leaflet.Marker;
    constructor(){
        super();
        document.createElement('div');
    }
}
export class StructureMarker extends leaflet.Marker{
    structureType: string;
    constructor(x: number,z: number,strucureType: string){
        super([-z,x], {
            title: `${strucureType}`,
            icon: new StructureIcon(strucureType)
        });
        this.bindPopup(`${x}, ${-z}`)
    }
}
export class StructureIcon extends leaflet.Icon{
    constructor(strucureType: string){
        super({
            iconUrl: `/icons/structures/${strucureType}.png`,
            iconSize: [20,20],
            popupAnchor: [0,-10]
        });
    }
}


let sgrid = new StructureGrid('outpost',32,map);
sgrid.addTo(map);
layer_control.addOverlay(sgrid, 'StructureGrid')

