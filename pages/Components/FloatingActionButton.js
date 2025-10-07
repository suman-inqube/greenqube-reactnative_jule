
import React, { useMemo } from "react";
import { FloatingAction } from "react-native-floating-action";
import { Colors } from "../utils/Constants";
const FloatingActionButton = ({
  t,             // i18n translation fn
  styles,        // style object
  actions,       // optional custom actions
  color = Colors.useGreen,
  position = "right",
  distanceToEdge = { vertical: 80, horizontal: 25 },
  overlayColor = "rgba(22, 17, 17, 0.35)",
  showBackground = true,
  onPressItem,
//   computedActionsValue
}) => {
  // Memoize actions for performance
  const computedActions = useMemo(() => {
    return actions ?? actions(t, styles, Colors);
  }, [actions, t, styles]);

  return (
    <FloatingAction
      position={position}
      actions={computedActions}
      color={color}
      onPressItem={onPressItem}
      showBackground={showBackground}
      overlayColor={overlayColor}
      distanceToEdge={distanceToEdge}
    />
  );
};

export default FloatingActionButton;
