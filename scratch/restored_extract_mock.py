            if feat['geometry']['type'] == 'Polygon':
                ring = coords[0]
                lats = [c[1] for c in ring]
                lngs = [c[0] for c in ring]
                lat_center = sum(lats) / len(lats)
                lng_center = sum(lngs) / len(lngs)
            elif feat['geometry']['type'] == 'MultiPolygon':
                ring = coords[0][0]
                lats = [c[1] for c in ring]
                lngs = [c[0] for c in ring]
                lat_center = sum(lats) / len(lats)
                lng_center = sum(lngs) / len(lngs)
            else:
                continue