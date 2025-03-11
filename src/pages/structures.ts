import * as leaflet from "https://unpkg.com/leaflet/dist/leaflet-src.esm.js";

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
                console.log("unloaded marker")
            }
        })
        this.on('tileload', function (event){
            let tile = event.tile as any;
            if ('linkedMarker' in tile) {
                map.addLayer(tile.linkedMarker);
                console.log("loaded marker")
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
                let marker = new leaflet.Marker([-structure.z, structure.x]);
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
