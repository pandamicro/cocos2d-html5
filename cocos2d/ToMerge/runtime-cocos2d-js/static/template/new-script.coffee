cc.FireClass {
    extends: Fire.Behavior

    properties: {
        # foo:
        #   default: null
        #   type: Fire
        #   serializable: true # [optional], default is true
        #   visible: true      # [optional], default is true
        #   displayName: 'Foo' # [optional], default is property name
        #   readonly: false    # [optional], default is false
    }

    update: (dt) ->
        # do your update here
}
