"""
plot points and topic labels interactivly

reads from:
* 'document_relations/tsne_df.pkl'
* 'document_relations/mds_df.pkl'
* 'comic_tags/comic_tags_df.pkl'

saves to:
* 'images/xxx.jpg'

@author: Gati Aher
"""

import json

import dash
import dash_core_components as dcc
import dash_html_components as html
from dash.dependencies import Input, Output

import pandas as pd
import numpy as np

external_stylesheets = ['https://codepen.io/chriddyp/pen/bWLwgP.css']

app = dash.Dash(__name__, external_stylesheets=external_stylesheets)

styles = {
    'pre': {
        'border': 'thin lightgrey solid',
        'overflowX': 'scroll'
    }
}

tsne = pd.read_pickle('document_relations/tsne_df.pkl')
mds = pd.read_pickle('document_relations/mds_df.pkl')

app.layout = html.Div([

    # dcc.Graph(
    #     id='basic-interactions',
    #     figure={
    #         'data': [
    #             {
    #                 'x': tsne['x'],
    #                 'y': tsne['y'],
    #                 'text': tsne.index.values,
    #                 'customdata': tsne.index.values,
    #                 'mode': 'markers',
    #                 'marker': {'size': 12}
    #             },
    #         ],
    #         'layout': {
    #             'clickmode': 'event+select'
    #         }
    #     }
    # ),

    ##############
    # TSNE GRAPH #
    ##############

    dcc.Graph(
        id='tsne',
        figure={
            'data': [
                {
                    'x': tsne['x'],
                    'y': tsne['y'],
                    'text': tsne.index,
                    'customdata': tsne.index,
                    'mode': 'markers',
                    'marker': {'size': 12}
                },
            ],
            'layout': {
                'clickmode': 'event+select',
                'width': 1,
                'height': 1
            }
        }
    ),

    ##############
    # TSNE GRAPH #
    ##############

    dcc.Graph(
        id='mds',
        figure={
            'data': [
                {
                    'x': mds['x'],
                    'y': mds['y'],
                    'text': mds.index,
                    'customdata': mds.index,
                    'mode': 'markers',
                    'marker': {'size': 12}
                },
            ],
            'layout': {
                'clickmode': 'event+select',
                'width': 1,
                'height': 1
            }
        }
    ),


    html.Div(className='row', children=[

        ########
        # TSNE #
        ########

        html.Div([
            dcc.Markdown("""
                **Click Data TSNE**

                Click on points in the graph.
            """),
            html.Pre(id='click-data-tsne', style=styles['pre']),
        ], className='three columns'),

        html.Div([
            dcc.Markdown("""
                **Selection Data TSNE**

                Choose the lasso or rectangle tool in the graph's menu
                bar and then select points in the graph.

                Note that if `layout.clickmode = 'event+select'`, selection data also
                accumulates (or un-accumulates) selected data if you hold down the shift
                button while clicking.
            """),
            html.Pre(id='selected-data-tsne', style=styles['pre']),
        ], className='three columns'),

        #######
        # MDS #
        #######

        html.Div([
            dcc.Markdown("""
                **Click Data MDS**

                Click on points in the graph.
            """),
            html.Pre(id='click-data-mds', style=styles['pre']),
        ], className='three columns'),

        html.Div([
            dcc.Markdown("""
                **Selection Data MDS**

                Choose the lasso or rectangle tool in the graph's menu
                bar and then select points in the graph.

                Note that if `layout.clickmode = 'event+select'`, selection data also
                accumulates (or un-accumulates) selected data if you hold down the shift
                button while clicking.
            """),
            html.Pre(id='selected-data-mds', style=styles['pre']),
        ], className='three columns'),

    ])
])

##################
# TSNE CALLBACKS #
##################

@app.callback(
    Output('click-data-tsne', 'children'),
    [Input('tsne', 'clickData')])
def display_click_data(clickData):
    return json.dumps(clickData, indent=2)

@app.callback(
    Output('selected-data-tsne', 'children'),
    [Input('tsne', 'selectedData')])
def display_selected_data(selectedData):
    return json.dumps(selectedData, indent=2)

#################
# MDS CALLBACKS #
#################

@app.callback(
    Output('click-data-mds', 'children'),
    [Input('mds', 'clickData')])
def display_click_data(clickData):
    return json.dumps(clickData, indent=2)

@app.callback(
    Output('selected-data-mds', 'children'),
    [Input('mds', 'selectedData')])
def display_selected_data(selectedData):
    return json.dumps(selectedData, indent=2)

#########
# OTHER #
#########

#################################################
# RETURN GRAPHS WITH ALL COMMON POINTS SELECTED #
#################################################

def get_figure(df, x_col, y_col, selectedpoints, selectedpoints_local):

    # if selectedpoints_local and selectedpoints_local['range']:
    #     ranges = selectedpoints_local['range']
    #     selection_bounds = {'x0': ranges['x'][0], 'x1': ranges['x'][1],
    #                         'y0': ranges['y'][0], 'y1': ranges['y'][1]}
    # else:
    #     selection_bounds = {'x0': np.min(df[x_col]), 'x1': np.max(df[x_col]),
    #                         'y0': np.min(df[y_col]), 'y1': np.max(df[y_col])}

    # set which points are selected with the `selectedpoints` property
    # and style those points with the `selected` and `unselected`
    # attribute. see
    # https://medium.com/@plotlygraphs/notes-from-the-latest-plotly-js-release-b035a5b43e21
    # for an explanation
    print(selectedpoints)

    return {
        'data': [{
            'x': df[x_col],
            'y': df[y_col],
            'text': df.index,
            'textposition': 'top',
            'selectedpoints': selectedpoints,
            'customdata': df.index,
            'type': 'scatter',
            'mode': 'markers+text',
            'marker': { 'color': 'rgba(0, 116, 217, 0.7)', 'size': 12 },
            'unselected': {
                'marker': { 'opacity': 0.3 },
                # make text transparent when not selected
                'textfont': { 'color': 'rgba(0, 0, 0, 0)' }
            }
        }],
        # 'layout': {
        #     'margin': {'l': 20, 'r': 0, 'b': 15, 't': 5},
        #     'dragmode': 'select',
        #     'hovermode': False,
        #     # Display a rectangle to highlight the previously selected region
        #     'shapes': [dict({
        #         'type': 'rect',
        #         'line': { 'width': 1, 'dash': 'dot', 'color': 'darkgrey' }
        #     }, **selection_bounds
        #     )]
        # }
        'layout': {
            'clickmode': 'event+select',
            'width': 1,
            'height': 1
        }
    }


@app.callback(
    [Output('tsne', 'figure'),
     Output('mds', 'figure')],
    [Input('tsne', 'selectedData'),
     Input('mds', 'selectedData')]
)
def callback(selection_tsne, selection_mds):
    selectedpoints = tsne.index

    for selected_data in [selection_tsne, selection_mds]:
        if selected_data and selected_data['points']:
            # Return the sorted, unique values that are in both of the input arrays.
            # selectedpoints = np.intersect1d(selectedpoints,
            #     [str(int(p['customdata'])-1) for p in selected_data['points']])
            selectedpoints = np.intersect1d(selectedpoints,
                [str(p['pointIndex']) for p in selected_data['points']])

    return [get_figure(tsne, "x", "y", selectedpoints, selection_tsne),
            get_figure(mds, "x", "y", selectedpoints, selection_mds)]

if __name__ == '__main__':
    app.run_server(debug=True)
