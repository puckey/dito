"use strict";

exports.__esModule = true;
exports.DitoGraphProcessor = void 0;

var _utils = require("@ditojs/utils");

var _ = require(".");

class DitoGraphProcessor {
  constructor(rootModelClass, data, options = {}, settings = {}) {
    this.rootModelClass = rootModelClass;
    this.data = (0, _.ensureModelArray)(rootModelClass, data, {
      skipValidation: true
    });
    this.isArray = (0, _utils.isArray)(data);
    this.options = options;
    this.settings = settings;
    this.overrides = {};
    this.extras = {};
    this.numOptions = Object.keys(options).length;
    this.numOverrides = 0;

    if (settings.processOverrides) {
      this.collectOverrides();

      if (this.numOverrides > 0) {
        this.processOverrides();
      }
    }
  }

  getOptions() {
    return { ...this.options,
      ...this.overrides
    };
  }

  getData() {
    const data = this.settings.processRelates ? this.processRelates(this.data) : this.data;
    return this.isArray ? data : data[0];
  }

  getGraphOptions(relation) {
    const ownerOptions = {
      relate: false,
      unrelate: false
    };
    return relation.graphOptions || relation.owner && ownerOptions || {};
  }

  collectOverrides() {
    const processed = {};

    const processModelClass = modelClass => {
      const {
        name
      } = modelClass;

      if (!processed[name]) {
        processed[name] = true;
        const {
          relations
        } = modelClass.definition;
        const relationInstances = modelClass.getRelations();

        for (const [name, relation] of Object.entries(relations)) {
          const graphOptions = this.getGraphOptions(relation);

          if (graphOptions) {
            for (const key in this.options) {
              if (key in graphOptions && graphOptions[key] !== this.options[key] && !this.overrides[key]) {
                this.numOverrides++;
                this.overrides[key] = [];
              }
            }

            if (this.numOverrides < this.numOptions) {
              processModelClass(relationInstances[name].relatedModelClass);
            }
          }
        }
      }
    };

    processModelClass(this.rootModelClass);
  }

  processOverrides() {
    const expr = (0, _.modelGraphToExpression)(this.data);

    const processExpression = (expr, modelClass, relation, relationPath = '') => {
      if (relation) {
        var _relation$through;

        const graphOptions = this.getGraphOptions(relation);

        for (const key in this.overrides) {
          var _graphOptions$key;

          const option = (_graphOptions$key = graphOptions[key]) != null ? _graphOptions$key : this.options[key];

          if (option) {
            this.overrides[key].push(relationPath);
          }
        }

        const extra = (_relation$through = relation.through) == null ? void 0 : _relation$through.extra;

        if ((extra == null ? void 0 : extra.length) > 0) {
          this.extras[relationPath] = extra;
        }
      }

      const {
        relations
      } = modelClass.definition;
      const relationInstances = modelClass.getRelations();

      for (const key in expr) {
        const childExpr = expr[key];
        const {
          relatedModelClass
        } = relationInstances[key];
        processExpression(childExpr, relatedModelClass, relations[key], appendPath(relationPath, '.', key));
      }
    };

    processExpression(expr, this.rootModelClass);
  }

  shouldRelate(relationPath) {
    if (relationPath !== '') {
      const {
        relate
      } = this.overrides;
      return relate ? relate.includes(relationPath) : this.options.relate;
    }
  }

  processRelates(data, relationPath = '', dataPath = '') {
    if (data) {
      if (data.$isObjectionModel) {
        const {
          constructor
        } = data;
        let copy;

        if (this.shouldRelate(relationPath)) {
          copy = constructor.getReference(data, this.extras[relationPath]);
        } else {
          copy = data.$clone({
            shallow: true
          });

          for (const {
            name
          } of Object.values(constructor.getRelations())) {
            if (name in data) {
              copy[name] = this.processRelates(data[name], appendPath(relationPath, '.', name), appendPath(dataPath, '/', name));
            }
          }
        }

        return copy;
      } else if ((0, _utils.isArray)(data)) {
        return data.map((entry, index) => this.processRelates(entry, relationPath, appendPath(dataPath, '/', index)));
      }
    }

    return data;
  }

}

exports.DitoGraphProcessor = DitoGraphProcessor;

function appendPath(path, separator, token) {
  return path !== '' ? `${path}${separator}${token}` : token;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ncmFwaC9EaXRvR3JhcGhQcm9jZXNzb3IuanMiXSwibmFtZXMiOlsiRGl0b0dyYXBoUHJvY2Vzc29yIiwiY29uc3RydWN0b3IiLCJyb290TW9kZWxDbGFzcyIsImRhdGEiLCJvcHRpb25zIiwic2V0dGluZ3MiLCJza2lwVmFsaWRhdGlvbiIsImlzQXJyYXkiLCJvdmVycmlkZXMiLCJleHRyYXMiLCJudW1PcHRpb25zIiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsIm51bU92ZXJyaWRlcyIsInByb2Nlc3NPdmVycmlkZXMiLCJjb2xsZWN0T3ZlcnJpZGVzIiwiZ2V0T3B0aW9ucyIsImdldERhdGEiLCJwcm9jZXNzUmVsYXRlcyIsImdldEdyYXBoT3B0aW9ucyIsInJlbGF0aW9uIiwib3duZXJPcHRpb25zIiwicmVsYXRlIiwidW5yZWxhdGUiLCJncmFwaE9wdGlvbnMiLCJvd25lciIsInByb2Nlc3NlZCIsInByb2Nlc3NNb2RlbENsYXNzIiwibW9kZWxDbGFzcyIsIm5hbWUiLCJyZWxhdGlvbnMiLCJkZWZpbml0aW9uIiwicmVsYXRpb25JbnN0YW5jZXMiLCJnZXRSZWxhdGlvbnMiLCJlbnRyaWVzIiwia2V5IiwicmVsYXRlZE1vZGVsQ2xhc3MiLCJleHByIiwicHJvY2Vzc0V4cHJlc3Npb24iLCJyZWxhdGlvblBhdGgiLCJvcHRpb24iLCJwdXNoIiwiZXh0cmEiLCJ0aHJvdWdoIiwiY2hpbGRFeHByIiwiYXBwZW5kUGF0aCIsInNob3VsZFJlbGF0ZSIsImluY2x1ZGVzIiwiZGF0YVBhdGgiLCIkaXNPYmplY3Rpb25Nb2RlbCIsImNvcHkiLCJnZXRSZWZlcmVuY2UiLCIkY2xvbmUiLCJzaGFsbG93IiwidmFsdWVzIiwibWFwIiwiZW50cnkiLCJpbmRleCIsInBhdGgiLCJzZXBhcmF0b3IiLCJ0b2tlbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7QUFDQTs7QUFFTyxNQUFNQSxrQkFBTixDQUF5QjtBQUM5QkMsRUFBQUEsV0FBVyxDQUFDQyxjQUFELEVBQWlCQyxJQUFqQixFQUF1QkMsT0FBTyxHQUFHLEVBQWpDLEVBQXFDQyxRQUFRLEdBQUcsRUFBaEQsRUFBb0Q7QUFDN0QsU0FBS0gsY0FBTCxHQUFzQkEsY0FBdEI7QUFDQSxTQUFLQyxJQUFMLEdBQVksd0JBQWlCRCxjQUFqQixFQUFpQ0MsSUFBakMsRUFBdUM7QUFDakRHLE1BQUFBLGNBQWMsRUFBRTtBQURpQyxLQUF2QyxDQUFaO0FBR0EsU0FBS0MsT0FBTCxHQUFlLG9CQUFRSixJQUFSLENBQWY7QUFDQSxTQUFLQyxPQUFMLEdBQWVBLE9BQWY7QUFDQSxTQUFLQyxRQUFMLEdBQWdCQSxRQUFoQjtBQUNBLFNBQUtHLFNBQUwsR0FBaUIsRUFBakI7QUFDQSxTQUFLQyxNQUFMLEdBQWMsRUFBZDtBQUNBLFNBQUtDLFVBQUwsR0FBa0JDLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZUixPQUFaLEVBQXFCUyxNQUF2QztBQUNBLFNBQUtDLFlBQUwsR0FBb0IsQ0FBcEI7O0FBQ0EsUUFBSVQsUUFBUSxDQUFDVSxnQkFBYixFQUErQjtBQUM3QixXQUFLQyxnQkFBTDs7QUFDQSxVQUFJLEtBQUtGLFlBQUwsR0FBb0IsQ0FBeEIsRUFBMkI7QUFDekIsYUFBS0MsZ0JBQUw7QUFDRDtBQUNGO0FBQ0Y7O0FBRURFLEVBQUFBLFVBQVUsR0FBRztBQUNYLFdBQU8sRUFDTCxHQUFHLEtBQUtiLE9BREg7QUFFTCxTQUFHLEtBQUtJO0FBRkgsS0FBUDtBQUlEOztBQUVEVSxFQUFBQSxPQUFPLEdBQUc7QUFHUixVQUFNZixJQUFJLEdBQUcsS0FBS0UsUUFBTCxDQUFjYyxjQUFkLEdBQ1QsS0FBS0EsY0FBTCxDQUFvQixLQUFLaEIsSUFBekIsQ0FEUyxHQUVULEtBQUtBLElBRlQ7QUFHQSxXQUFPLEtBQUtJLE9BQUwsR0FBZUosSUFBZixHQUFzQkEsSUFBSSxDQUFDLENBQUQsQ0FBakM7QUFDRDs7QUFFRGlCLEVBQUFBLGVBQWUsQ0FBQ0MsUUFBRCxFQUFXO0FBSXhCLFVBQU1DLFlBQVksR0FBRztBQUNuQkMsTUFBQUEsTUFBTSxFQUFFLEtBRFc7QUFFbkJDLE1BQUFBLFFBQVEsRUFBRTtBQUZTLEtBQXJCO0FBS0EsV0FBT0gsUUFBUSxDQUFDSSxZQUFULElBQXlCSixRQUFRLENBQUNLLEtBQVQsSUFBa0JKLFlBQTNDLElBQTJELEVBQWxFO0FBQ0Q7O0FBT0ROLEVBQUFBLGdCQUFnQixHQUFHO0FBS2pCLFVBQU1XLFNBQVMsR0FBRyxFQUFsQjs7QUFDQSxVQUFNQyxpQkFBaUIsR0FBR0MsVUFBVSxJQUFJO0FBQ3RDLFlBQU07QUFBRUMsUUFBQUE7QUFBRixVQUFXRCxVQUFqQjs7QUFFQSxVQUFJLENBQUNGLFNBQVMsQ0FBQ0csSUFBRCxDQUFkLEVBQXNCO0FBQ3BCSCxRQUFBQSxTQUFTLENBQUNHLElBQUQsQ0FBVCxHQUFrQixJQUFsQjtBQUNBLGNBQU07QUFBRUMsVUFBQUE7QUFBRixZQUFnQkYsVUFBVSxDQUFDRyxVQUFqQztBQUNBLGNBQU1DLGlCQUFpQixHQUFHSixVQUFVLENBQUNLLFlBQVgsRUFBMUI7O0FBQ0EsYUFBSyxNQUFNLENBQUNKLElBQUQsRUFBT1QsUUFBUCxDQUFYLElBQStCVixNQUFNLENBQUN3QixPQUFQLENBQWVKLFNBQWYsQ0FBL0IsRUFBMEQ7QUFDeEQsZ0JBQU1OLFlBQVksR0FBRyxLQUFLTCxlQUFMLENBQXFCQyxRQUFyQixDQUFyQjs7QUFDQSxjQUFJSSxZQUFKLEVBQWtCO0FBSWhCLGlCQUFLLE1BQU1XLEdBQVgsSUFBa0IsS0FBS2hDLE9BQXZCLEVBQWdDO0FBQzlCLGtCQUFJZ0MsR0FBRyxJQUFJWCxZQUFQLElBQ0FBLFlBQVksQ0FBQ1csR0FBRCxDQUFaLEtBQXNCLEtBQUtoQyxPQUFMLENBQWFnQyxHQUFiLENBRHRCLElBRUEsQ0FBQyxLQUFLNUIsU0FBTCxDQUFlNEIsR0FBZixDQUZMLEVBRTBCO0FBQ3hCLHFCQUFLdEIsWUFBTDtBQUNBLHFCQUFLTixTQUFMLENBQWU0QixHQUFmLElBQXNCLEVBQXRCO0FBQ0Q7QUFDRjs7QUFHRCxnQkFBSSxLQUFLdEIsWUFBTCxHQUFvQixLQUFLSixVQUE3QixFQUF5QztBQUN2Q2tCLGNBQUFBLGlCQUFpQixDQUFDSyxpQkFBaUIsQ0FBQ0gsSUFBRCxDQUFqQixDQUF3Qk8saUJBQXpCLENBQWpCO0FBQ0Q7QUFDRjtBQUNGO0FBQ0Y7QUFDRixLQTdCRDs7QUErQkFULElBQUFBLGlCQUFpQixDQUFDLEtBQUsxQixjQUFOLENBQWpCO0FBQ0Q7O0FBT0RhLEVBQUFBLGdCQUFnQixHQUFHO0FBQ2pCLFVBQU11QixJQUFJLEdBQUcsOEJBQXVCLEtBQUtuQyxJQUE1QixDQUFiOztBQUVBLFVBQU1vQyxpQkFBaUIsR0FDckIsQ0FBQ0QsSUFBRCxFQUFPVCxVQUFQLEVBQW1CUixRQUFuQixFQUE2Qm1CLFlBQVksR0FBRyxFQUE1QyxLQUFtRDtBQUNqRCxVQUFJbkIsUUFBSixFQUFjO0FBQUE7O0FBQ1osY0FBTUksWUFBWSxHQUFHLEtBQUtMLGVBQUwsQ0FBcUJDLFFBQXJCLENBQXJCOztBQUlBLGFBQUssTUFBTWUsR0FBWCxJQUFrQixLQUFLNUIsU0FBdkIsRUFBa0M7QUFBQTs7QUFDaEMsZ0JBQU1pQyxNQUFNLHdCQUFHaEIsWUFBWSxDQUFDVyxHQUFELENBQWYsZ0NBQXdCLEtBQUtoQyxPQUFMLENBQWFnQyxHQUFiLENBQXBDOztBQUNBLGNBQUlLLE1BQUosRUFBWTtBQUNWLGlCQUFLakMsU0FBTCxDQUFlNEIsR0FBZixFQUFvQk0sSUFBcEIsQ0FBeUJGLFlBQXpCO0FBQ0Q7QUFDRjs7QUFHRCxjQUFNRyxLQUFLLHdCQUFHdEIsUUFBUSxDQUFDdUIsT0FBWixxQkFBRyxrQkFBa0JELEtBQWhDOztBQUNBLFlBQUksQ0FBQUEsS0FBSyxRQUFMLFlBQUFBLEtBQUssQ0FBRTlCLE1BQVAsSUFBZ0IsQ0FBcEIsRUFBdUI7QUFDckIsZUFBS0osTUFBTCxDQUFZK0IsWUFBWixJQUE0QkcsS0FBNUI7QUFDRDtBQUNGOztBQUVELFlBQU07QUFBRVosUUFBQUE7QUFBRixVQUFnQkYsVUFBVSxDQUFDRyxVQUFqQztBQUNBLFlBQU1DLGlCQUFpQixHQUFHSixVQUFVLENBQUNLLFlBQVgsRUFBMUI7O0FBQ0EsV0FBSyxNQUFNRSxHQUFYLElBQWtCRSxJQUFsQixFQUF3QjtBQUN0QixjQUFNTyxTQUFTLEdBQUdQLElBQUksQ0FBQ0YsR0FBRCxDQUF0QjtBQUNBLGNBQU07QUFBRUMsVUFBQUE7QUFBRixZQUF3QkosaUJBQWlCLENBQUNHLEdBQUQsQ0FBL0M7QUFDQUcsUUFBQUEsaUJBQWlCLENBQ2ZNLFNBRGUsRUFFZlIsaUJBRmUsRUFHZk4sU0FBUyxDQUFDSyxHQUFELENBSE0sRUFJZlUsVUFBVSxDQUFDTixZQUFELEVBQWUsR0FBZixFQUFvQkosR0FBcEIsQ0FKSyxDQUFqQjtBQU1EO0FBQ0YsS0FqQ0g7O0FBbUNBRyxJQUFBQSxpQkFBaUIsQ0FBQ0QsSUFBRCxFQUFPLEtBQUtwQyxjQUFaLENBQWpCO0FBQ0Q7O0FBRUQ2QyxFQUFBQSxZQUFZLENBQUNQLFlBQUQsRUFBZTtBQUV6QixRQUFJQSxZQUFZLEtBQUssRUFBckIsRUFBeUI7QUFDdkIsWUFBTTtBQUFFakIsUUFBQUE7QUFBRixVQUFhLEtBQUtmLFNBQXhCO0FBQ0EsYUFBT2UsTUFBTSxHQUdUQSxNQUFNLENBQUN5QixRQUFQLENBQWdCUixZQUFoQixDQUhTLEdBSVQsS0FBS3BDLE9BQUwsQ0FBYW1CLE1BSmpCO0FBS0Q7QUFDRjs7QUFTREosRUFBQUEsY0FBYyxDQUFDaEIsSUFBRCxFQUFPcUMsWUFBWSxHQUFHLEVBQXRCLEVBQTBCUyxRQUFRLEdBQUcsRUFBckMsRUFBeUM7QUFDckQsUUFBSTlDLElBQUosRUFBVTtBQUNSLFVBQUlBLElBQUksQ0FBQytDLGlCQUFULEVBQTRCO0FBQzFCLGNBQU07QUFBRWpELFVBQUFBO0FBQUYsWUFBa0JFLElBQXhCO0FBQ0EsWUFBSWdELElBQUo7O0FBQ0EsWUFBSSxLQUFLSixZQUFMLENBQWtCUCxZQUFsQixDQUFKLEVBQXFDO0FBR25DVyxVQUFBQSxJQUFJLEdBQUdsRCxXQUFXLENBQUNtRCxZQUFaLENBQXlCakQsSUFBekIsRUFBK0IsS0FBS00sTUFBTCxDQUFZK0IsWUFBWixDQUEvQixDQUFQO0FBQ0QsU0FKRCxNQUlPO0FBSUxXLFVBQUFBLElBQUksR0FBR2hELElBQUksQ0FBQ2tELE1BQUwsQ0FBWTtBQUFFQyxZQUFBQSxPQUFPLEVBQUU7QUFBWCxXQUFaLENBQVA7O0FBRUEsZUFBSyxNQUFNO0FBQUV4QixZQUFBQTtBQUFGLFdBQVgsSUFBdUJuQixNQUFNLENBQUM0QyxNQUFQLENBQWN0RCxXQUFXLENBQUNpQyxZQUFaLEVBQWQsQ0FBdkIsRUFBa0U7QUFDaEUsZ0JBQUlKLElBQUksSUFBSTNCLElBQVosRUFBa0I7QUFDaEJnRCxjQUFBQSxJQUFJLENBQUNyQixJQUFELENBQUosR0FBYSxLQUFLWCxjQUFMLENBQ1hoQixJQUFJLENBQUMyQixJQUFELENBRE8sRUFFWGdCLFVBQVUsQ0FBQ04sWUFBRCxFQUFlLEdBQWYsRUFBb0JWLElBQXBCLENBRkMsRUFHWGdCLFVBQVUsQ0FBQ0csUUFBRCxFQUFXLEdBQVgsRUFBZ0JuQixJQUFoQixDQUhDLENBQWI7QUFLRDtBQUNGO0FBQ0Y7O0FBQ0QsZUFBT3FCLElBQVA7QUFDRCxPQXhCRCxNQXdCTyxJQUFJLG9CQUFRaEQsSUFBUixDQUFKLEVBQW1CO0FBRXhCLGVBQU9BLElBQUksQ0FBQ3FELEdBQUwsQ0FBUyxDQUFDQyxLQUFELEVBQVFDLEtBQVIsS0FBa0IsS0FBS3ZDLGNBQUwsQ0FDaENzQyxLQURnQyxFQUVoQ2pCLFlBRmdDLEVBR2hDTSxVQUFVLENBQUNHLFFBQUQsRUFBVyxHQUFYLEVBQWdCUyxLQUFoQixDQUhzQixDQUEzQixDQUFQO0FBS0Q7QUFDRjs7QUFDRCxXQUFPdkQsSUFBUDtBQUNEOztBQW5NNkI7Ozs7QUFzTWhDLFNBQVMyQyxVQUFULENBQW9CYSxJQUFwQixFQUEwQkMsU0FBMUIsRUFBcUNDLEtBQXJDLEVBQTRDO0FBQzFDLFNBQU9GLElBQUksS0FBSyxFQUFULEdBQWUsR0FBRUEsSUFBSyxHQUFFQyxTQUFVLEdBQUVDLEtBQU0sRUFBMUMsR0FBOENBLEtBQXJEO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc0FycmF5IH0gZnJvbSAnQGRpdG9qcy91dGlscydcbmltcG9ydCB7IG1vZGVsR3JhcGhUb0V4cHJlc3Npb24sIGVuc3VyZU1vZGVsQXJyYXkgfSBmcm9tICcuJ1xuXG5leHBvcnQgY2xhc3MgRGl0b0dyYXBoUHJvY2Vzc29yIHtcbiAgY29uc3RydWN0b3Iocm9vdE1vZGVsQ2xhc3MsIGRhdGEsIG9wdGlvbnMgPSB7fSwgc2V0dGluZ3MgPSB7fSkge1xuICAgIHRoaXMucm9vdE1vZGVsQ2xhc3MgPSByb290TW9kZWxDbGFzc1xuICAgIHRoaXMuZGF0YSA9IGVuc3VyZU1vZGVsQXJyYXkocm9vdE1vZGVsQ2xhc3MsIGRhdGEsIHtcbiAgICAgIHNraXBWYWxpZGF0aW9uOiB0cnVlXG4gICAgfSlcbiAgICB0aGlzLmlzQXJyYXkgPSBpc0FycmF5KGRhdGEpXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5nc1xuICAgIHRoaXMub3ZlcnJpZGVzID0ge31cbiAgICB0aGlzLmV4dHJhcyA9IHt9XG4gICAgdGhpcy5udW1PcHRpb25zID0gT2JqZWN0LmtleXMob3B0aW9ucykubGVuZ3RoXG4gICAgdGhpcy5udW1PdmVycmlkZXMgPSAwXG4gICAgaWYgKHNldHRpbmdzLnByb2Nlc3NPdmVycmlkZXMpIHtcbiAgICAgIHRoaXMuY29sbGVjdE92ZXJyaWRlcygpXG4gICAgICBpZiAodGhpcy5udW1PdmVycmlkZXMgPiAwKSB7XG4gICAgICAgIHRoaXMucHJvY2Vzc092ZXJyaWRlcygpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0T3B0aW9ucygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4udGhpcy5vcHRpb25zLFxuICAgICAgLi4udGhpcy5vdmVycmlkZXNcbiAgICB9XG4gIH1cblxuICBnZXREYXRhKCkge1xuICAgIC8vIElmIHNldHRpbmcucHJvY2Vzc1JlbGF0ZXMgaXMgdXNlZCwgY2FsbCBwcm9jZXNzUmVsYXRlKCkgdG8gZmlsdGVyIG91dFxuICAgIC8vIG5lc3RlZCByZWxhdGlvbnMgb2YgbW9kZWxzIHRoYXQgYXJlIHVzZWQgZm9yIHJlbGF0ZXMuXG4gICAgY29uc3QgZGF0YSA9IHRoaXMuc2V0dGluZ3MucHJvY2Vzc1JlbGF0ZXNcbiAgICAgID8gdGhpcy5wcm9jZXNzUmVsYXRlcyh0aGlzLmRhdGEpXG4gICAgICA6IHRoaXMuZGF0YVxuICAgIHJldHVybiB0aGlzLmlzQXJyYXkgPyBkYXRhIDogZGF0YVswXVxuICB9XG5cbiAgZ2V0R3JhcGhPcHRpb25zKHJlbGF0aW9uKSB7XG4gICAgLy8gV2hlbiBhIHJlbGF0aW9uIGlzIG93bmVyIG9mIGl0cyBkYXRhLCB0aGVuIGEgZmFsbC1iYWNrIGZvciBgZ3JhcGhPcHRpb25zYFxuICAgIC8vIGlzIHByb3ZpZGVkIHdoZXJlIGJvdGggYHJlbGF0ZWAgYW5kIGB1bnJlbGF0ZWAgaXMgZGlzYWJsZWQsIHJlc3VsdGluZyBpblxuICAgIC8vIGluc2VydHMgYW5kIGRlbGV0ZXMgaW5zdGVhZC5cbiAgICBjb25zdCBvd25lck9wdGlvbnMgPSB7XG4gICAgICByZWxhdGU6IGZhbHNlLFxuICAgICAgdW5yZWxhdGU6IGZhbHNlXG4gICAgfVxuICAgIC8vIERldGVybWluZSB0aGUgYGdyYXBoT3B0aW9uc2AgdG8gYmUgdXNlZCBmb3IgdGhpcyByZWxhdGlvbi5cbiAgICByZXR1cm4gcmVsYXRpb24uZ3JhcGhPcHRpb25zIHx8IHJlbGF0aW9uLm93bmVyICYmIG93bmVyT3B0aW9ucyB8fCB7fVxuICB9XG5cbiAgLyoqXG4gICAqIExvb3BzIHRocm91Z2ggYWxsIG5lc3RlZCByZWxhdGlvbnMgYW5kIGZpbmRzIHRoZSBvbmVzIHRoYXQgZGVmaW5lIGxvY2FsXG4gICAqIG92ZXJyaWRlcyBvZiB0aGUgZ2xvYmFsIG9wdGlvbnMsIHRoZW4gY29sbGVjdHMgZW1wdHkgb3ZlcnJpZGUgYXJyYXlzIGZvclxuICAgKiBlYWNoIHNldHRpbmcsIHNvIHByb2Nlc3NPdmVycmlkZXMoKSBjYW4gZmlsbCB0aGVtIGlmIGFueSBvdmVycmlkZXMgZXhpc3QuXG4gICAqL1xuICBjb2xsZWN0T3ZlcnJpZGVzKCkge1xuICAgIC8vIFRPRE86IHdlIG1heSB3YW50IG9wdGltaXplIHRoaXMgY29kZSB0byBvbmx5IGNvbGxlY3QgdGhlIG92ZXJyaWRlcyBmb3JcbiAgICAvLyB0aGUgcmVsYXRpb25zIHRoYXQgYXJlIGFjdHVhbGx5IHVzZWQgaW4gdGhlIGdyYXBoLCBlLmcuIHRocm91Z2hcbiAgICAvLyBgbW9kZWxHcmFwaFRvRXhwcmVzc2lvbihkYXRhKWAuIFNob3VsZCB3ZSBldmVyIHN3aXRjaCB0byBvdXIgb3duXG4gICAgLy8gaW1wbGVtZW50YXRpb24gb2YgKkFuZEZldGNoKCkgbWV0aG9kcywgd2UgYWxyZWFkeSBoYXZlIHRvIGNhbGwgdGhpcy5cbiAgICBjb25zdCBwcm9jZXNzZWQgPSB7fVxuICAgIGNvbnN0IHByb2Nlc3NNb2RlbENsYXNzID0gbW9kZWxDbGFzcyA9PiB7XG4gICAgICBjb25zdCB7IG5hbWUgfSA9IG1vZGVsQ2xhc3NcbiAgICAgIC8vIE9ubHkgcHJvY2VzcyBlYWNoIG1vZGVsQ2xhc3Mgb25jZSwgdG8gYXZvaWQgY2lyY3VsYXIgcmVmZXJlbmNlIGxvb3BzLlxuICAgICAgaWYgKCFwcm9jZXNzZWRbbmFtZV0pIHtcbiAgICAgICAgcHJvY2Vzc2VkW25hbWVdID0gdHJ1ZVxuICAgICAgICBjb25zdCB7IHJlbGF0aW9ucyB9ID0gbW9kZWxDbGFzcy5kZWZpbml0aW9uXG4gICAgICAgIGNvbnN0IHJlbGF0aW9uSW5zdGFuY2VzID0gbW9kZWxDbGFzcy5nZXRSZWxhdGlvbnMoKVxuICAgICAgICBmb3IgKGNvbnN0IFtuYW1lLCByZWxhdGlvbl0gb2YgT2JqZWN0LmVudHJpZXMocmVsYXRpb25zKSkge1xuICAgICAgICAgIGNvbnN0IGdyYXBoT3B0aW9ucyA9IHRoaXMuZ2V0R3JhcGhPcHRpb25zKHJlbGF0aW9uKVxuICAgICAgICAgIGlmIChncmFwaE9wdGlvbnMpIHtcbiAgICAgICAgICAgIC8vIExvb3AgdGhyb3VnaCBgdGhpcy5vcHRpb25zYCBhbmQgb25seSBsb29rIGZvciBvdmVycmlkZXMgb2YgdGhlbSxcbiAgICAgICAgICAgIC8vIHNpbmNlIGByZWxhdGlvbi5ncmFwaE9wdGlvbnNgIGlzIGFjcm9zcyBpbnNlcnQgIC8gdXBzZXJ0ICYgY28uLFxuICAgICAgICAgICAgLy8gYnV0IG5vdCBhbGwgb2YgdGhlbSB1c2UgYWxsIG9wdGlvbnMgKGluc2VydCBkZWZpbmVzIGxlc3MpLlxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gdGhpcy5vcHRpb25zKSB7XG4gICAgICAgICAgICAgIGlmIChrZXkgaW4gZ3JhcGhPcHRpb25zICYmXG4gICAgICAgICAgICAgICAgICBncmFwaE9wdGlvbnNba2V5XSAhPT0gdGhpcy5vcHRpb25zW2tleV0gJiZcbiAgICAgICAgICAgICAgICAgICF0aGlzLm92ZXJyaWRlc1trZXldKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5udW1PdmVycmlkZXMrK1xuICAgICAgICAgICAgICAgIHRoaXMub3ZlcnJpZGVzW2tleV0gPSBbXVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBLZWVwIHNjYW5uaW5nIHVudGlsIHdlJ3JlIGRvbmUgb3IgZm91bmQgdGhhdCBhbGwgb3B0aW9ucyBoYXZlXG4gICAgICAgICAgICAvLyBvdmVycmlkZXMuXG4gICAgICAgICAgICBpZiAodGhpcy5udW1PdmVycmlkZXMgPCB0aGlzLm51bU9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgcHJvY2Vzc01vZGVsQ2xhc3MocmVsYXRpb25JbnN0YW5jZXNbbmFtZV0ucmVsYXRlZE1vZGVsQ2xhc3MpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcHJvY2Vzc01vZGVsQ2xhc3ModGhpcy5yb290TW9kZWxDbGFzcylcbiAgfVxuXG4gIC8qKlxuICAgKiBGaWxscyB0aGUgZW1wdHkgb3ZlcnJpZGUgYXJyYXlzIGNvbGxlY3RlZCBieSBjb2xsZWN0T3ZlcnJpZGVzKCkgYnkgd2Fsa2luZ1xuICAgKiB0aHJvdWdoIHRoZSBhY3R1YWwgZ3JhcGggYW5kIGZpbmRpbmcgcmVsYXRpb25zIHRoYXQgaGF2ZSBvdmVycmlkZXMsIGFuZFxuICAgKiBidWlsZGluZyByZWxhdGlvbiBwYXRocyBmb3IgdGhlbS5cbiAgICovXG4gIHByb2Nlc3NPdmVycmlkZXMoKSB7XG4gICAgY29uc3QgZXhwciA9IG1vZGVsR3JhcGhUb0V4cHJlc3Npb24odGhpcy5kYXRhKVxuXG4gICAgY29uc3QgcHJvY2Vzc0V4cHJlc3Npb24gPVxuICAgICAgKGV4cHIsIG1vZGVsQ2xhc3MsIHJlbGF0aW9uLCByZWxhdGlvblBhdGggPSAnJykgPT4ge1xuICAgICAgICBpZiAocmVsYXRpb24pIHtcbiAgICAgICAgICBjb25zdCBncmFwaE9wdGlvbnMgPSB0aGlzLmdldEdyYXBoT3B0aW9ucyhyZWxhdGlvbilcbiAgICAgICAgICAvLyBMb29wIHRocm91Z2ggYWxsIG92ZXJyaWRlIG9wdGlvbnMsIGZpZ3VyZSBvdXQgdGhlaXIgc2V0dGluZ3MgZm9yXG4gICAgICAgICAgLy8gdGhlIGN1cnJlbnQgcmVsYXRpb24gYW5kIGJ1aWxkIHJlbGF0aW9uIGV4cHJlc3Npb24gYXJyYXlzIGZvciBlYWNoXG4gICAgICAgICAgLy8gb3ZlcnJpZGUgcmVmbGVjdGluZyB0aGVpciBuZXN0ZWQgc2V0dGluZ3MgaW4gYXJyYXlzIG9mIGV4cHJlc3Npb25zLlxuICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHRoaXMub3ZlcnJpZGVzKSB7XG4gICAgICAgICAgICBjb25zdCBvcHRpb24gPSBncmFwaE9wdGlvbnNba2V5XSA/PyB0aGlzLm9wdGlvbnNba2V5XVxuICAgICAgICAgICAgaWYgKG9wdGlvbikge1xuICAgICAgICAgICAgICB0aGlzLm92ZXJyaWRlc1trZXldLnB1c2gocmVsYXRpb25QYXRoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEFsc28gY29sbGVjdCBhbnkgbWFueS10by1tYW55IHBpdm90IHRhYmxlIGV4dHJhIHByb3BlcnRpZXMuXG4gICAgICAgICAgY29uc3QgZXh0cmEgPSByZWxhdGlvbi50aHJvdWdoPy5leHRyYVxuICAgICAgICAgIGlmIChleHRyYT8ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5leHRyYXNbcmVsYXRpb25QYXRoXSA9IGV4dHJhXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgeyByZWxhdGlvbnMgfSA9IG1vZGVsQ2xhc3MuZGVmaW5pdGlvblxuICAgICAgICBjb25zdCByZWxhdGlvbkluc3RhbmNlcyA9IG1vZGVsQ2xhc3MuZ2V0UmVsYXRpb25zKClcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gZXhwcikge1xuICAgICAgICAgIGNvbnN0IGNoaWxkRXhwciA9IGV4cHJba2V5XVxuICAgICAgICAgIGNvbnN0IHsgcmVsYXRlZE1vZGVsQ2xhc3MgfSA9IHJlbGF0aW9uSW5zdGFuY2VzW2tleV1cbiAgICAgICAgICBwcm9jZXNzRXhwcmVzc2lvbihcbiAgICAgICAgICAgIGNoaWxkRXhwcixcbiAgICAgICAgICAgIHJlbGF0ZWRNb2RlbENsYXNzLFxuICAgICAgICAgICAgcmVsYXRpb25zW2tleV0sXG4gICAgICAgICAgICBhcHBlbmRQYXRoKHJlbGF0aW9uUGF0aCwgJy4nLCBrZXkpXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICBwcm9jZXNzRXhwcmVzc2lvbihleHByLCB0aGlzLnJvb3RNb2RlbENsYXNzKVxuICB9XG5cbiAgc2hvdWxkUmVsYXRlKHJlbGF0aW9uUGF0aCkge1xuICAgIC8vIFJvb3Qgb2JqZWN0cyAocmVsYXRpb25QYXRoID09PSAnJykgc2hvdWxkIG5ldmVyIHJlbGF0ZS5cbiAgICBpZiAocmVsYXRpb25QYXRoICE9PSAnJykge1xuICAgICAgY29uc3QgeyByZWxhdGUgfSA9IHRoaXMub3ZlcnJpZGVzXG4gICAgICByZXR1cm4gcmVsYXRlXG4gICAgICAgIC8vIFNlZSBpZiB0aGUgcmVsYXRlIG92ZXJyaWRlcyBjb250YWluIHRoaXMgcGFydGljdWxhciByZWxhdGlvbi1QYXRoXG4gICAgICAgIC8vIGFuZCBvbmx5IHJlbW92ZSBhbmQgcmVzdG9yZSByZWxhdGlvbiBkYXRhIGlmIHJlbGF0ZSBpcyB0byBiZSB1c2VkXG4gICAgICAgID8gcmVsYXRlLmluY2x1ZGVzKHJlbGF0aW9uUGF0aClcbiAgICAgICAgOiB0aGlzLm9wdGlvbnMucmVsYXRlXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgcmVsYXRlIG9wdGlvbiBieSBkZXRlY3RpbmcgT2JqZWN0aW9uIGluc3RhbmNlcyBpbiB0aGUgZ3JhcGggYW5kXG4gICAqIGNvbnZlcnRpbmcgdGhlbSB0byBzaGFsbG93IGlkIGxpbmtzLlxuICAgKlxuICAgKiBGb3IgZGV0YWlscywgc2VlOlxuICAgKiBodHRwczovL2dpdHRlci5pbS9WaW5jaXQvb2JqZWN0aW9uLmpzP2F0PTVhNDI0NmVlYmEzOWE1M2YxYWEzYTNiMVxuICAgKi9cbiAgcHJvY2Vzc1JlbGF0ZXMoZGF0YSwgcmVsYXRpb25QYXRoID0gJycsIGRhdGFQYXRoID0gJycpIHtcbiAgICBpZiAoZGF0YSkge1xuICAgICAgaWYgKGRhdGEuJGlzT2JqZWN0aW9uTW9kZWwpIHtcbiAgICAgICAgY29uc3QgeyBjb25zdHJ1Y3RvciB9ID0gZGF0YVxuICAgICAgICBsZXQgY29weVxuICAgICAgICBpZiAodGhpcy5zaG91bGRSZWxhdGUocmVsYXRpb25QYXRoKSkge1xuICAgICAgICAgIC8vIEZvciByZWxhdGVzLCBzdGFydCB3aXRoIGEgcmVmZXJlbmNlIG1vZGVsIHRoYXQgb25seSBjb250YWlucyB0aGVcbiAgICAgICAgICAvLyBpZCAvICNyZWYgZmllbGRzLCBhbmQgYW55IG1hbnktdG8tbWFueSBwaXZvdCB0YWJsZSBleHRyYSB2YWx1ZXM6XG4gICAgICAgICAgY29weSA9IGNvbnN0cnVjdG9yLmdldFJlZmVyZW5jZShkYXRhLCB0aGlzLmV4dHJhc1tyZWxhdGlvblBhdGhdKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFRoaXMgaXNuJ3QgYSByZWxhdGUsIHNvIGNyZWF0ZSBhIHByb3BlciBzaGFsbG93IGNsb25lOlxuICAgICAgICAgIC8vIE5PVEU6IFRoaXMgYWxzbyBjb3BpZXMgYCQkcXVlcnlQcm9wc2AsIHdoaWNoIGlzIGNydWNpYWwgZm9yIG1vcmVcbiAgICAgICAgICAvLyBhZHZhbmNlZCBPYmplY3Rpb24uanMgZmVhdHVyZXMgdG8gd29yaywgZS5nLiBMaXRlcmFsQnVpbGRlcjpcbiAgICAgICAgICBjb3B5ID0gZGF0YS4kY2xvbmUoeyBzaGFsbG93OiB0cnVlIH0pXG4gICAgICAgICAgLy8gRm9sbG93IGFsbCByZWxhdGlvbnMgYW5kIGtlZXAgcHJvY2Vzc2luZzpcbiAgICAgICAgICBmb3IgKGNvbnN0IHsgbmFtZSB9IG9mIE9iamVjdC52YWx1ZXMoY29uc3RydWN0b3IuZ2V0UmVsYXRpb25zKCkpKSB7XG4gICAgICAgICAgICBpZiAobmFtZSBpbiBkYXRhKSB7XG4gICAgICAgICAgICAgIGNvcHlbbmFtZV0gPSB0aGlzLnByb2Nlc3NSZWxhdGVzKFxuICAgICAgICAgICAgICAgIGRhdGFbbmFtZV0sXG4gICAgICAgICAgICAgICAgYXBwZW5kUGF0aChyZWxhdGlvblBhdGgsICcuJywgbmFtZSksXG4gICAgICAgICAgICAgICAgYXBwZW5kUGF0aChkYXRhUGF0aCwgJy8nLCBuYW1lKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb3B5XG4gICAgICB9IGVsc2UgaWYgKGlzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgLy8gUG90ZW50aWFsbHkgYSBoYXMtbWFueSByZWxhdGlvbiwgc28ga2VlcCBwcm9jZXNzaW5nIHJlbGF0ZXM6XG4gICAgICAgIHJldHVybiBkYXRhLm1hcCgoZW50cnksIGluZGV4KSA9PiB0aGlzLnByb2Nlc3NSZWxhdGVzKFxuICAgICAgICAgIGVudHJ5LFxuICAgICAgICAgIHJlbGF0aW9uUGF0aCxcbiAgICAgICAgICBhcHBlbmRQYXRoKGRhdGFQYXRoLCAnLycsIGluZGV4KVxuICAgICAgICApKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YVxuICB9XG59XG5cbmZ1bmN0aW9uIGFwcGVuZFBhdGgocGF0aCwgc2VwYXJhdG9yLCB0b2tlbikge1xuICByZXR1cm4gcGF0aCAhPT0gJycgPyBgJHtwYXRofSR7c2VwYXJhdG9yfSR7dG9rZW59YCA6IHRva2VuXG59XG4iXX0=